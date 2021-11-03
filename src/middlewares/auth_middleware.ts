import { Request, Response, NextFunction } from "express";
import { expect } from "chai";

import { jwtRegex } from "../commons/regexs";
import asyncHandler from "../decorators/async_handler";
import { User } from "../entities/User";

class AuthMiddleware {
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
}

export default new AuthMiddleware();
