import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { getRepository } from "typeorm";
import * as FileType from "file-type";

import { mustInRangeIfExist } from "../decorators/assert_decorators";
import asyncHandler from "../decorators/async_handler";
import {
    isBinaryIfExist,
    isNumberIfExist,
    mustExist,
    mustExistOne,
} from "../decorators/validate_decorators";
import { Stream, STREAM_KEY_LENGTH } from "../entities/Stream";
import mediaService from "../services/media_service";
import extractFilenameFromPath from "../utils/extract_filename_from_path";
import { randomString } from "../utils/string_function";

class StreamController {
    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getStreams(req: Request, res: Response) {
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const streams = await getRepository(Stream)
            .createQueryBuilder("streams")
            .innerJoin("streams.user", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("streams.isStreaming IS TRUE")
            .skip(offset)
            .take(limit)
            .getMany();

        return res.status(200).json({
            data: streams,
        });
    }

    @asyncHandler
    public async getStream(req: Request, res: Response) {
        const { stream_id } = req.params;

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .innerJoin("streams.user", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where({ id: stream_id })
            .getOne();

        expect(stream, "404:stream not found").to.exist;

        res.status(200).json({
            data: stream,
        });
    }

    @asyncHandler
    public async getOwnStream(req: Request, res: Response) {
        const { auth } = req.local;

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .addSelect("streams.streamKey")
            .innerJoin("streams.user", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("users.id = :userId", { userId: auth.id })
            .getOne();

        expect(stream, "404:stream not found").to.exist;

        res.status(200).json({
            data: stream,
        });
    }

    @asyncHandler
    @mustExistOne("body.name", "files.thumbnail", "renew_key")
    @isBinaryIfExist("body.renew_key")
    public async updateStreamInfo(req: Request, res: Response, next: NextFunction) {
        const { auth } = req.local;
        const { thumbnail } = req.files;
        const { name } = req.body;
        const renew_key = req.body.renew_key === "1";

        if (thumbnail) {
            const thumbnailType = await FileType.fromFile(thumbnail.path);
            expect(thumbnailType.ext, "400:invalid thumbnail").to.be.oneOf(["jpg", "png"]);
        }

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .addSelect("streams.streamKey")
            .innerJoin("streams.user", "users")
            .where("users.id = :userId", { userId: auth.id })
            .getOne();

        if (renew_key) {
            stream.streamKey = randomString(STREAM_KEY_LENGTH);
        }
        if (name) {
            stream.name = name;
        }
        if (thumbnail) {
            const { thumbnailPath } = await mediaService.processThumbnail(thumbnail);
            if (stream.thumbnailPath !== null) {
                await mediaService.deleteThumbnail(extractFilenameFromPath(stream.thumbnailPath));
            }
            stream.thumbnailPath = thumbnailPath;
        }

        await getRepository(Stream).save(stream);

        res.status(200).json({
            data: stream,
        });
        next();
    }

    @asyncHandler
    @mustExist("body.stream_key", "body.status")
    public async updateStreamStatus(req: Request, res: Response) {
        const { stream_id } = req.params;
        const { stream_key, status } = req.body;

        expect(status, "400:invalid stream status").to.be.oneOf(["live", "off"]);

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .addSelect("streams.streamKey")
            .where({ id: stream_id })
            .getOne();

        expect(stream, "404:stream not found").to.exist;
        expect(stream_key, "401:stream_key not match").to.equal(stream.streamKey);

        stream.isStreaming = status === "live";
        await getRepository(Stream).save(stream);

        res.status(200).json({
            data: stream,
        });
    }
}

export default new StreamController();
