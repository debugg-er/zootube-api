import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import { isBinary, mustExist } from "../decorators/validate_decorators";
import { LoginLog } from "../entities/LoginLog";
import { USER_ID } from "../entities/Role";
import { Stream, STREAM_KEY_LENGTH } from "../entities/Stream";
import { User } from "../entities/User";
import { randomString } from "../utils/string_function";
import redisService from "../services/redis_service";

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

        const newUser = getRepository(User).create({
            username: username,
            password: password,
            firstName: first_name,
            lastName: last_name,
            female: female,
            isBlocked: false,
            role: { id: USER_ID },
        });
        await getRepository(User).insert(newUser);

        const userStream = getRepository(Stream).create({
            id: await Stream.generateId(),
            streamKey: randomString(STREAM_KEY_LENGTH),
            name: newUser.username + " Stream!",
            isStreaming: false,
            user: { id: newUser.id },
        });
        await getRepository(Stream).insert(userStream);

        const token = await user.signJWT();
        const decoedToken = await User.verifyJWT(token);
        await getRepository(LoginLog).insert({
            user: user,
            token: token,
            expireAt: new Date(decoedToken.exp * 1000),
            ...LoginLog.parseUserAgent(req.get("user-agent")),
        });

        res.status(201).json({
            data: { token: token },
        });
    }

    @asyncHandler
    @mustExist("body.username", "body.password")
    public async login(req: Request, res: Response) {
        const { username, password } = req.body;

        const user = await getRepository(User)
            .createQueryBuilder("users")
            .select(["users.id", "users.username", "users.password", "users.isBlocked"])
            .innerJoinAndSelect("users.role", "roles")
            .where("LOWER(username) = :username", { username: username.toLowerCase() })
            .getOne();

        expect(user, "404:username doesn't exists").to.exist;
        expect(user.isBlocked, "405:user was blocked").to.be.false;
        const isPasswordMatch = await user.comparePassword(password);
        expect(isPasswordMatch, "400:password don't match").to.be.true;

        const token = await user.signJWT();
        const decoedToken = await User.verifyJWT(token);
        await getRepository(LoginLog).insert({
            user: user,
            token: token,
            expireAt: new Date(decoedToken.exp * 1000),
            ...LoginLog.parseUserAgent(req.get("user-agent")),
        });

        res.status(200).json({
            data: { token: token },
        });
    }

    @asyncHandler
    public async logout(req: Request, res: Response) {
        const { auth } = req.local;
        const [, token] = req.headers.authorization.split(" ");

        const { affected } = await getRepository(LoginLog).update(
            {
                user: { id: auth.id },
                token: token,
                loggedOutAt: null,
            },
            {
                loggedOutAt: new Date(),
            },
        );
        expect(affected, "404:login info not found").to.not.equal(0);
        await redisService.addTokensToBlacklist(token);

        res.status(200).json({
            data: { message: "logged out" },
        });
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

    @asyncHandler
    public async getLoginLogs(req: Request, res: Response) {
        const { auth } = req.local;

        const loginLogs = await getRepository(LoginLog).find({
            select: [
                "id",
                "loggedInAt",
                "loggedOutAt",
                "expireAt",
                "os",
                "cpu",
                "device",
                "browser",
            ],
            where: { user: { id: auth.id } },
        });

        res.status(200).json({
            data: loginLogs,
        });
    }
}

export default new AuthController();
