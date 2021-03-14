import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as Busboy from "busboy";
import { Request, Response, NextFunction, RequestHandler } from "express";

import asyncHander from "../decorators/async_handler";
import { randomString } from "../utils/string_function";
import { Fields, Files } from "../interfaces/general";

const tempPath = path.join(__dirname, "../../tmp");

class MultipartMiddleware {
    public storeUploadFiles(..._fields: string[]): RequestHandler {
        return function storeUploadFiles(req: Request, res: Response, next: NextFunction) {
            const busboy = new Busboy({ headers: req.headers });

            let files: Files = {};
            let fields: Fields = {};

            busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
                // prevent upload multiple files or not in allow files
                if (files[fieldname] !== undefined || !_fields.includes(fieldname)) {
                    file.resume();
                    return;
                }

                // ?? next file could be read before current file have not saved
                // hence, I asign this to null for checking upload multiple files in the code above
                files[fieldname] = null;

                // warning: error occur when filename have dot in the end
                const type = /[^.]\./.exec(filename)
                    ? /[^.]+$/.exec(filename).toString()
                    : undefined;
                const name = randomString(32) + (type ? "." + type : "");
                const _path = path.join(tempPath, name);

                file.on("end", () => {
                    files[fieldname] = {
                        path: _path,
                        name: name,
                        mimetype: mimetype,
                        type: type,
                    };
                });

                file.pipe(fs.createWriteStream(_path));
            });

            busboy.on("field", (fieldname, val) => {
                fields[fieldname] = val;
            });

            busboy.on("finish", function () {
                req.body = fields;
                req.files = files;

                next();
            });

            req.pipe(busboy);
        };
    }

    @asyncHander
    public async removeUploadedFiles(req: Request, res: Response, next: NextFunction) {
        await Promise.all(_.values(req.files).map((file) => fs.promises.unlink(file.path)));

        next();
    }
}

export default new MultipartMiddleware();
