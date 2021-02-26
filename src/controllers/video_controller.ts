import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
import getVideoDuration from "../utils/get_video_duration";
import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { getRepository, In } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import env from "../providers/env";
import { Video } from "../entities/Video";
import { Category } from "../entities/Category";
import { mustExist, mustExistOne } from "../decorators/validate_decorators";
import { randomString } from "../utils/string_function";
import extractFrame from "../utils/extract_frame";

const tempPath = path.join(__dirname, "../../tmp");
const listRegex = /^[a-zA-Z]([a-zA-Z,]*[a-zA-z])?$/;

class VideoController {
    @asyncHandler
    @mustExist("body.title", "files.video")
    public async uploadVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description, categories } = req.body;
        const { video } = req.files;

        expect(video.mimetype, "400:invalid video").to.match(/^video/);
        expect(categories, "400:invalid categories").to.match(listRegex);

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
            categories: await getRepository(Category).find({
                where: { category: In(categories.split(",")) },
            }),
        });

        await videoRepository.save(_video);

        res.status(201).json({
            data: _video,
        });

        await fs.promises.unlink(thumbnailPath);

        next();
    }

    @asyncHandler
    public async getVideos(req: Request, res: Response, next: NextFunction) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.offset || 30;

        const videos = await getRepository(Video).find({
            relations: ["categories"],
            where: { uploadedBy: { id } },
            order: { uploadedAt: "DESC" },
            skip: offset,
            take: limit,
        });

        // videos.forEach((video) => {
        //     video.videoPath = env.STATIC_SERVER_ENDPOINT + video.videoPath;
        //     video.thumbnailPath = env.STATIC_SERVER_ENDPOINT + video.thumbnailPath;
        // });

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @mustExistOne("body.title", "body.description", "body.categories", "files.thumbnail")
    public async updateVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description, categories } = req.body;
        const { thumbnail } = req.files;
        const { video } = req.local;

        video.title = title || video.title;
        video.description = description || video.description;

        if (categories) {
            expect(categories, "400:invalid categories").to.match(listRegex);
            video.categories = await getRepository(Category).find({
                where: { category: In(categories.split(",")) },
            });
        }

        if (thumbnail) {
            expect(thumbnail.mimetype, "400:invalid thumbnail").to.match(/^image/);
            await request.post(env.STATIC_SERVER_ENDPOINT + "/thumbnails", {
                formData: {
                    file: {
                        value: fs.createReadStream(thumbnail.path),
                        options: {
                            filename: thumbnail.name,
                            contentType: thumbnail.mimetype,
                        },
                    },
                },
            });

            await request.delete(env.STATIC_SERVER_ENDPOINT + video.thumbnailPath);

            video.thumbnailPath = "/thumbnails/" + thumbnail.name;
        }

        await getRepository(Video).save(video);

        res.status(200).json({
            data: video,
        });
    }

    @asyncHandler
    public async deleteVideo(req: Request, res: Response, next: NextFunction) {
        const { video } = req.local;

        await request.delete(env.STATIC_SERVER_ENDPOINT + video.videoPath);
        await request.delete(env.STATIC_SERVER_ENDPOINT + video.thumbnailPath);

        await getRepository(Video).delete(video);

        res.status(200).json({
            data: { message: "deleted video" },
        });
    }
}

export default new VideoController();
