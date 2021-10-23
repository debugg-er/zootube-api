import { expect } from "chai";
import { NextFunction, Request, Response } from "express";
import { getManager, getRepository } from "typeorm";
import { jwtRegex } from "../commons/regexs";
import asyncHandler from "../decorators/async_handler";
import { isBinary, mustExist } from "../decorators/validate_decorators";
import { USER_ID } from "../entities/Role";
import { Stream, STREAM_KEY_LENGTH } from "../entities/Stream";
import { User } from "../entities/User";
import { randomString } from "../utils/string_function";

class AuthController {
    @asyncHandler
    @mustExist("body.username", "body.password", "body.first_name", "body.last_name", "body.female")
    @isBinary("body.female")
    public async register(req: Request, res: Response) {
        const { username, password, first_name, last_name } = req.body;
        const female: boolean = req.body.female === "1";

        const user = await getRepository(User)
            .createQueryBuilder("users")
            .select("TRUE")
            .where("LOWER(username) = :username", { username: username.toLowerCase() })
            .getRawOne();
        expect(user, "400:username already exists").to.not.exist;

        await getManager().transaction(async (entityManager) => {
            const newUser = getRepository(User).create({
                username: username,
                password: password,
                firstName: first_name,
                lastName: last_name,
                female: female,
                isBlocked: false,
                role: { id: USER_ID },
            });
            await entityManager.insert(User, newUser);

            const userStream = getRepository(Stream).create({
                id: await Stream.generateId(),
                streamKey: randomString(STREAM_KEY_LENGTH),
                name: newUser.username + " Stream!",
                isStreaming: false,
                user: { id: newUser.id },
            });
            await entityManager.insert(Stream, userStream);

            res.status(201).json({
                data: {
                    token: await newUser.signJWT(),
                },
            });
        });
    }

    @asyncHandler
    @mustExist("body.username", "body.password")
    public async login(req: Request, res: Response) {
        const { username, password } = req.body;

        const userRepository = getRepository(User);

        const user = await userRepository
            .createQueryBuilder("users")
            .select(["users.id", "users.username", "users.password", "users.isBlocked"])
            .innerJoinAndSelect("users.role", "roles")
            .where("LOWER(username) = :username", { username: username.toLowerCase() })
            .getOne();

        expect(user, "404:username doesn't exists").to.exist;
        expect(user.isBlocked, "405:user was blocked").to.be.false;

        const isPasswordMatch = await user.comparePassword(password);
        expect(isPasswordMatch, "400:password don't match").to.be.true;

        res.status(200).json({
            data: {
                token: await user.signJWT(),
            },
        });
    }

    @asyncHandler
    public async authorize(req: Request, res: Response, next: NextFunction) {
        const authorization: string = req.headers.authorization;

        expect(authorization, "401:missing token").to.exist;
        expect(authorization, "401:invalid token format").to.match(jwtRegex);

        // prettier-ignore
        const [/* type */, token] = authorization.split(' ');
        const decoded = await User.verifyJWT(token);

        req.local.auth = decoded;
        next();
    }

    public async authorizeIfGiven(req: Request, res: Response, next: NextFunction) {
        const authorization: string = req.headers.authorization;

        try {
            expect(authorization, "401:missing token").to.exist;
            expect(authorization, "401:invalid token format").to.match(jwtRegex);

            // prettier-ignore
            const [/* type */, token] = authorization.split(' ');
            const decoded = await User.verifyJWT(token);

            req.local.auth = decoded;
            next();
        } catch {
            next();
        }
    }

    @asyncHandler
    @mustExist("body.old_password", "body.new_password")
    public async changePassword(req: Request, res: Response) {
        const { old_password, new_password } = req.body;
        const username = req.local.auth.username;

        const userRepository = getRepository(User);

        const user = await userRepository.findOne({ username }, { select: ["id", "password"] });

        const isMatch = await user.comparePassword(old_password);
        expect(isMatch, "400:password don't match").to.be.true;

        user.password = new_password;
        await userRepository.save(user);

        return res.status(200).json({
            data: { message: "change password success" },
        });
    }
}

export default new AuthController();
