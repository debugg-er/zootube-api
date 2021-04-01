import * as fs from "fs";
import * as _ from "lodash";
import { Request, Response, NextFunction } from "express";

import env from "../providers/env";
import logger from "../providers/logger";

class CleanMiddleware {
    /**
     * This middleware don't throw any error. So, it won't go to error middleware
     */
    public removeTempFiles(req: Request, res: Response, next: NextFunction) {
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

        next();
    }
}

export default new CleanMiddleware();
