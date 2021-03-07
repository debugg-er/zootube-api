import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { getRepository, In } from "typeorm";

import env from "../providers/env";
import { listRegex } from "../commons/regexs";
import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist, mustExist, mustExistOne } from "../decorators/validate_decorators";
import { mustInRangeIfExist, mustMatchIfExist } from "../decorators/assert_decorators";
import { Category } from "../entities/Category";
import { Video } from "../entities/Video";
import { VideoLike } from "../entities/VideoLike";
import { WatchedVideo } from "../entities/WatchedVideo";
import extractFrame from "../utils/extract_frame";
import getVideoDuration from "../utils/get_video_duration";
import { randomString } from "../utils/string_function";

const tempPath = path.join(__dirname, "../../tmp");

class VideoController {
    @asyncHandler
    @mustExist("body.title", "files.video")
    @mustMatchIfExist("body.categories", listRegex)
    public async uploadVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description, categories } = req.body;
        const { video } = req.files;

        expect(video.mimetype, "400:invalid video").to.match(/^video/);

        const uploadedAt = new Date(); // manualy insert uploadedAt to avoid incorrect cause by post request
        const duration = await getVideoDuration(video.path);
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

        if (categories) {
            _video.categories = await getRepository(Category).find({
                where: { category: In(categories.split(",")) },
            });
        }

        await videoRepository.insert(_video);

        res.status(201).json({
            data: _video,
        });

        await fs.promises.unlink(thumbnailPath);

        next();
    }

    @asyncHandler
    public async getVideo(req: Request, res: Response) {
        const { video_id } = req.params;

        const videoRepository = getRepository(Video);

        const video = await videoRepository
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .loadRelationCountAndMap("videos.like", "videos.videoLikes", "a", (qb) =>
                qb.andWhere("a.like = true"),
            )
            .loadRelationCountAndMap("videos.dislike", "videos.videoLikes", "a", (qb) =>
                qb.andWhere("a.like = false"),
            )
            .where({ id: video_id })
            .getOne();

        expect(video, "404:video not found").to.exist;

        res.status(200).json({
            data: video,
        });

        await videoRepository.update(video.id, { views: video.views + 1 });

        // store history if user logged in
        if (req.local.auth) {
            const { id } = req.local.auth;
            const watchedVideoRepository = getRepository(WatchedVideo);

            const watchedVideo = await watchedVideoRepository.findOne({
                userId: id,
                videoId: video_id,
            });

            // update watchedVideo timestamps if it was watched before
            if (watchedVideo) {
                watchedVideo.watchedAt = new Date();
                await watchedVideoRepository.update(
                    { userId: id, videoId: video_id },
                    { watchedAt: new Date() },
                );

                // if not, insert new watchedVideo to db
            } else {
                await watchedVideoRepository.insert(
                    watchedVideoRepository.create({
                        userId: id,
                        videoId: video_id,
                        watchedAt: new Date(),
                    }),
                );
            }
        }
    }

    @asyncHandler
    @mustExist("body.reaction")
    public async reactVideo(req: Request, res: Response) {
        const { video_id } = req.params;
        const { reaction } = req.body;

        expect(reaction, "400:invalid parameters").to.be.oneOf(["like", "dislike"]);

        const videoLikeRepository = getRepository(VideoLike);
        const isLike = reaction === "like";

        const videoLike = videoLikeRepository.create({
            videoId: video_id,
            userId: req.local.auth.id,
            like: isLike,
        });

        await videoLikeRepository.save(videoLike);

        res.status(200).json({
            data: { message: isLike ? "liked" : "disliked" },
        });
    }

    @asyncHandler
    public async deleteVideoReaction(req: Request, res: Response) {
        const { video_id } = req.params;

        await getRepository(VideoLike).delete({
            videoId: video_id,
            userId: req.local.auth.id,
        });

        res.status(200).json({
            data: { message: "deleted reaction" },
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getSubscriptionVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const videos = await getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .innerJoin(
                (subquery) => {
                    return subquery
                        .select("user_id")
                        .from("subscriptions", "sub")
                        .where("sub.subscriber_id = :subscriberId", { subscriberId: id });
                },
                "subscriptions",
                "subscriptions.user_id = videos.uploadedBy",
            )
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getWatchedVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const watchedHistories = await getRepository(WatchedVideo)
            .createQueryBuilder("watchedVideos")
            .leftJoinAndSelect("watchedVideos.video", "videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ userId: id })
            .orderBy("watchedVideos.watchedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        const videos = watchedHistories.map((watchedVideo) => ({
            ...watchedVideo.video,
            watchedAt: watchedVideo.watchedAt,
        }));

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @mustExistOne("body.title", "body.description", "body.categories", "files.thumbnail")
    @mustMatchIfExist("body.categories", listRegex)
    public async updateVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description, categories } = req.body;
        const { thumbnail } = req.files;
        const { video } = req.local;

        video.title = title || video.title;
        video.description = description || video.description;

        if (categories) {
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

        next();
    }

    @asyncHandler
    public async deleteVideo(req: Request, res: Response) {
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
