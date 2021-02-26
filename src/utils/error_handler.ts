import { Request, Response, NextFunction } from "express";
import { AssertionError } from "chai";
import env from "../providers/env";
import logger from "../providers/logger";
import { ModelError } from "../commons/errors";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export async function clientErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (env.NODE_ENV === "development") {
        console.log(err);
    }

    if (err instanceof ModelError) {
        return res.status(400).json({
            fail: { message: err.message },
        });
    }

    if (err instanceof AssertionError) {
        const [status, message] = err.message.split(":");
        return res.status(parseInt(status)).json({
            fail: { message: message },
        });
    }

    if (err instanceof TokenExpiredError) {
        return res.status(401).json({
            error: { message: "token expired" },
        });
    }

    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({
            error: { message: "invalid token" },
        });
    }

    next(err);
}

export function serverErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (env.NODE_ENV === "production") {
        logger.error(err);
    } else if (env.NODE_ENV === "development") {
        console.log(err);
    }

    if (res.writableEnded) return;

    return res.status(500).json({
        error: { message: "Internal server error" },
    });
}
