import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { getRepository } from "typeorm";

import { mustInRangeIfExist } from "../decorators/assert_decorators";
import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist, mustExist } from "../decorators/validate_decorators";
import { Stream } from "../entities/Stream";
import { Video } from "../entities/Video";
import { PRIVATE_ID } from "../entities/Privacy";
import mediaService from "../services/media_service";

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
        if (status === "live") {
            expect(stream.isStreaming, "400:stream has been started").to.be.false;
        } else if (status === "off") {
            expect(stream.isStreaming, "400:stream has been ended").to.be.true;
        }

        stream.isStreaming = status === "live";
        if (status === "off") stream.lastStreamedAt = new Date();
        await getRepository(Stream).save(stream);

        res.status(200).json({
            data: stream,
        });
    }

    @asyncHandler
    @mustExist("body.video", "body.stream_id", "body.stream_key")
    public async uploadStreamedVideo(req: Request, res: Response, next: NextFunction) {
        const { stream_id, stream_key, video } = req.body;

        const stream = await getRepository(Stream).findOne({
            where: { id: stream_id, streamKey: stream_key },
            relations: ["user"],
        });
        expect(stream, "404:stream not found").to.exist;

        const videoEntity = getRepository(Video).create({
            id: await Video.generateId(),
            title: new Date().toLocaleString(),
            views: 0,
            uploadedBy: { id: stream.user.id },
            privacy: { id: PRIVATE_ID },
        });
        await videoEntity.validate();

        res.status(200).json({
            data: {
                message: "upload video success, waiting to process",
            },
        });

        const { videoPath, thumbnailPath, duration } = await mediaService.processVideo(video);
        videoEntity.videoPath = videoPath;
        videoEntity.thumbnailPath = thumbnailPath;
        videoEntity.duration = duration;

        await getRepository(Video).save(videoEntity);
        next();
    }
}

export default new StreamController();
