import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
import getVideoDuration from "../utils/get_video_duration";
import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import env from "../providers/env";
import { Video } from "../entities/Video";
import { mustExist } from "../decorators/validate_decorators";
import { randomString } from "../utils/string_function";
import extractFrame from "../utils/extract_frame";

const tempPath = path.join(__dirname, "../../tmp");

class VideoController {
    @asyncHandler
    @mustExist("body.title", "files.video")
    public async uploadVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description } = req.body;
        const { video } = req.files;

        expect(video.mimetype, "400:invalid video").to.match(/^video/);

        const uploadedAt = new Date(); // manualy insert uploadedAt to avoid incorrect cause by post request
        const duration = Math.floor(await getVideoDuration(video.path));
        const thumbnailName = randomString(32) + ".png";

        await extractFrame(video.path, {
            count: 1,
            folder: tempPath,
            filename: thumbnailName,
            timestamps: [duration / 2],
        });

        const thumbnailPath = path.join(tempPath, thumbnailName);

        await request.post(env.STATIC_SERVER_ENDPOINT + "/videos", {
            formData: {
                file: {
                    value: fs.createReadStream(video.path),
                    options: {
                        filename: video.name,
                        contentType: video.mimetype,
                    },
                },
            },
        });

        await request.post(env.STATIC_SERVER_ENDPOINT + "/thumbnails", {
            formData: {
                file: {
                    value: fs.createReadStream(thumbnailPath),
                    options: {
                        filename: thumbnailName,
                        contentType: "image/png",
                    },
                },
            },
        });

        const videoRepository = getRepository(Video);

        const _video = videoRepository.create({
            id: await Video.generateId(),
            title: title,
            duration: duration,
            videoPath: "/videos/" + video.name,
            thumbnailPath: "/thumbnails/" + thumbnailName,
            description: description,
            views: 0,
            uploadedAt: uploadedAt,
            uploadedBy: { id: req.local.auth.id },
        });

        await videoRepository.save(_video);

        res.status(201).json({
            data: { ..._video },
        });

        await fs.promises.unlink(thumbnailPath);

        next();
    }

    @asyncHandler
    public async deleteVideo(req: Request, res: Response, next: NextFunction) {
        const { video } = req.local;

        console.log(env.STATIC_SERVER_ENDPOINT + video.videoPath);
        await request.delete(env.STATIC_SERVER_ENDPOINT + video.videoPath);
        await request.delete(env.STATIC_SERVER_ENDPOINT + video.thumbnailPath);

        await getRepository(Video).delete(video);

        res.status(200).json({
            data: { message: "deleted video" },
        });
    }
}

export default new VideoController();
