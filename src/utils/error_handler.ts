import * as fs from "fs";
import * as _ from "lodash";
import { Request, Response, NextFunction } from "express";
import { AssertionError } from "chai";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ValidationError } from "class-validator";

import env from "../providers/env";
import logger from "../providers/logger";
import { ModelError } from "../commons/errors";
import { MediaServiceError } from "../services/media_service";

export function removeTempFiles(err: Error, req: Request, res: Response, next: NextFunction) {
    if (req.files || req.local.tempFilePaths.length !== 0) {
        const filePathWillBeRemoved = [
            ...(req.files ? _.values(req.files).map((file) => file.path) : []),
            ...req.local.tempFilePaths,
        ];

        filePathWillBeRemoved.forEach((filePath) => {
            fs.unlink(filePath, (err) => {
                if (err) {
                    if (env.NODE_ENV === "development") {
                        console.log(err);
                    } else if (env.NODE_ENV === "production") {
                        logger.error(err);
                    }
                }
            });
        });
    }

    next(err);
}

export function clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (env.NODE_ENV === "development") {
        console.log(err);
    }

    if (Array.isArray(err) && err?.[0] instanceof ValidationError) {
        return res.status(400).json({
            fail: {
                message: err
                    .reduce((acc, cur) => [...acc, ...Object.values(cur.constraints)], [])
                    .join(", "),
            },
        });
    }

    if (err instanceof MediaServiceError) {
        return res.status(400).json({
            fail: { message: err.message },
        });
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
