import { Request, Response, NextFunction } from "express";
import { AssertionError } from "chai";
import logger from "../providers/logger";

export async function clientErrorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof AssertionError) {
        const [status, message] = err.message.split(":");
        return res.status(parseInt(status)).json({
            error: { message: message },
        });
    }

    next(err);
}

export function serverErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(err);

    if (res.writableEnded) return;

    return res.status(500).json({
        error: { message: "Internal server error" },
    });
}
