import { NextFunction, Request, Response } from "express";
import { expect } from "chai";
import { Brackets, createQueryBuilder, getRepository, In } from "typeorm";

import {
    isBinaryIfExist,
    isDateFormatIfExist,
    isNumberIfExist,
    mustExist,
    mustExistOne,
} from "../decorators/validate_decorators";
import mediaService from "../services/media_service";
import { listRegex } from "../commons/regexs";
import asyncHandler from "../decorators/async_handler";
import { mustInRangeIfExist, mustMatchIfExist } from "../decorators/assert_decorators";
import { Category } from "../entities/Category";
import { Video } from "../entities/Video";
import { VideoLike } from "../entities/VideoLike";
import { WatchedVideo } from "../entities/WatchedVideo";
import extractFilenameFromPath from "../utils/extract_filename_from_path";
import { VideoView } from "../entities/VideoView";
import { PRIVATE, PRIVATE_ID, PUBLIC, PUBLIC_ID } from "../entities/Privacy";

class VideoController {
    @asyncHandler
    @mustExist("body.title", "body.video")
    @mustMatchIfExist("body.categories", listRegex)
    @isNumberIfExist("body.thumbnail_timestamp")
    public async uploadVideo(req: Request, res: Response, next: NextFunction) {
        const thumbnail_timestamp = +req.body.thumbnail_timestamp;
        const { video, title, description, categories, privacy = PUBLIC } = req.body;

        expect(privacy, "400:invalid privacy value").to.be.oneOf([PUBLIC, PRIVATE]);

        const videoEntity = getRepository(Video).create({
            id: await Video.generateId(),
            title: title,
            description: description,
            views: 0,
            uploadedBy: { id: req.local.auth.id },
            privacy: { id: privacy === PUBLIC ? PUBLIC_ID : PRIVATE_ID },
        });
        await videoEntity.validate();

        const { videoPath, thumbnailPath, duration } = await mediaService.processVideo(
            video,
            thumbnail_timestamp || undefined,
        );
        videoEntity.videoPath = videoPath;
        videoEntity.thumbnailPath = thumbnailPath;
        videoEntity.duration = duration;

        if (categories) {
            videoEntity.categories = await getRepository(Category).find({
                where: { category: In(categories.split(",")) },
            });
        }

        // use .save to also insert category entities
        await getRepository(Video).save(videoEntity);
        res.status(200).json({
            data: videoEntity,
        });
        next();
    }

    @asyncHandler
    @isBinaryIfExist("query.is_watch")
    public async getVideo(req: Request, res: Response) {
        const is_watch = req.query.is_watch === "1";
        const { video_id } = req.params;
        const { auth } = req.local;

        const videoRepository = getRepository(Video);

        let videoQueryBuilder = videoRepository
            .createQueryBuilder("videos")
            .addSelect(["videos.videoPath", "videos.isBlocked"])
            .innerJoinAndSelect("videos.privacy", "privacies")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .loadRelationCountAndMap("videos.like", "videos.videoLikes", "a", (qb) =>
                qb.andWhere("a.like = true"),
            )
            .loadRelationCountAndMap("videos.dislike", "videos.videoLikes", "a", (qb) =>
                qb.andWhere("a.like = false"),
            )
            .loadRelationCountAndMap("videos.totalComments", "videos.comments")
            .where({ id: video_id });

        if (auth) {
            videoQueryBuilder.addSelect(
                (qb) =>
                    qb
                        .select("vl.like", "react")
                        .from(VideoLike, "vl")
                        .where("vl.video_id = :videoId AND vl.user_id = :userId", {
                            videoId: video_id,
                            userId: auth.id,
                        }),
                "videos_react",
            );
        } else {
            videoQueryBuilder.addSelect("NULL", "videos_react");
        }

        const video = await videoQueryBuilder.getOne();
        res.status(200).json({
            data: video,
        });
        if (!is_watch) return;

        // increase view count
        await video.increaseView();
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
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getVideos(req: Request, res: Response) {
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;
        const category = req.query.category as string;
        const sort = req.query.sort || "hot";
        const { auth } = req.local;

        expect(sort, "400:invalid sort option").to.be.oneOf(["newest", "view_rate", "hot"]);

        let videoQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .innerJoin("videos.uploadedBy", "users")
            .innerJoinAndSelect("videos.privacy", "privacies")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .leftJoinAndSelect("videos.categories", "categories")
            .where("videos.isBlocked IS FALSE")
            .andWhere("users.isBlocked IS FALSE")
            .andWhere(
                new Brackets((qb) => {
                    qb.where(`privacies.id = ${PUBLIC_ID}`);
                    if (auth) {
                        qb.orWhere("users.id = :userId", { userId: auth.id });
                    }
                }),
            )
            .skip(offset)
            .take(limit);

        // category filter
        if (category) {
            videoQueryBuilder = videoQueryBuilder.andWhere("categories.category = :category", {
                category: category,
            });
        }

        // sort
        if (sort === "newest") {
            videoQueryBuilder = videoQueryBuilder.orderBy("videos.uploadedAt", "DESC");
        } else if (sort === "view_rate") {
            videoQueryBuilder = videoQueryBuilder
                .addSelect(
                    "videos.views / (DATE_PART('DAY', CURRENT_DATE - videos.uploadedAt) + 1)",
                    "view_rate",
                )
                .orderBy("view_rate", "DESC");
        } else if (sort === "hot") {
            videoQueryBuilder = videoQueryBuilder
                .addSelect(
                    (qb) =>
                        qb
                            .select("COALESCE(SUM(vv.views), 0)", "week_views")
                            .from(VideoView, "vv")
                            .where("vv.video_id = videos.id")
                            .andWhere("vv.date > CURRENT_DATE - INTERVAL '7 DAYS'"),
                    "week_views",
                )
                .orderBy("week_views", "DESC");
        }

        const videos = await videoQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
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
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .innerJoinAndSelect("videos.privacy", "privacies")
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
            .where("videos.isBlocked IS FALSE")
            .andWhere("users.isBlocked IS FALSE")
            .andWhere(`privacies.id = ${PUBLIC_ID}`)
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @mustExistOne("body.title", "body.description", "body.categories", "body.thumbnail")
    @mustMatchIfExist("body.categories", listRegex)
    public async updateVideo(req: Request, res: Response, next: NextFunction) {
        const { title, description, categories, privacy, thumbnail } = req.body;
        const { video } = req.local;

        if (privacy) {
            expect(privacy, "400:invalid privacy value").to.be.oneOf([PUBLIC, PRIVATE]);
        }

        video.title = title || video.title;
        video.description = description || video.description;

        if (categories) {
            video.categories = await getRepository(Category).find({
                where: { category: In(categories.split(",")) },
            });
        }
        if (privacy) {
            video.privacy.id = privacy === PUBLIC ? PUBLIC_ID : PRIVATE_ID;
            video.privacy.name = privacy;
        }

        await video.validate();
        if (thumbnail) {
            const { thumbnailPath } = await mediaService.processThumbnail(thumbnail);
            await mediaService.deleteThumbnail(extractFilenameFromPath(video.thumbnailPath));

            video.thumbnailPath = thumbnailPath;
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

        await mediaService.deleteVideo(extractFilenameFromPath(video.videoPath));
        await mediaService.deleteThumbnail(extractFilenameFromPath(video.thumbnailPath));

        await getRepository(Video).delete({ id: video.id });

        res.status(200).json({
            data: { message: "deleted video" },
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getLikedVideos(req: Request, res: Response) {
        const { auth } = req.local;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const videoLikes = await getRepository(VideoLike)
            .createQueryBuilder("video_likes")
            .innerJoinAndSelect("video_likes.video", "videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoinAndSelect("videos.privacy", "privacies")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("video_likes.like IS TRUE")
            .andWhere("video_likes.user_id = :userId", { userId: auth.id })
            .skip(offset)
            .take(limit)
            .orderBy("video_likes.reactedAt", "DESC")
            .getMany();

        const videos = videoLikes
            .map((videoLike) => ({
                ...videoLike.video,
                reactedAt: videoLike.reactedAt,
            }))
            .map((video) => {
                // nullify if don't have permission
                if (
                    video.privacy.id === PRIVATE_ID &&
                    (!auth || video.uploadedBy.username !== auth.username)
                ) {
                    return {
                        id: video.id,
                        reactedAt: video.reactedAt,
                        uploadedBy: video.uploadedBy,
                    };
                }
                // nullify if (video | video owner) was blocked
                if (video.uploadedBy.isBlocked || video.isBlocked) {
                    return {
                        id: video.id,
                        reactedAt: video.reactedAt,
                        uploadedBy: video.uploadedBy,
                    };
                }
                delete video.isBlocked;
                delete video.uploadedBy.isBlocked;
                return video;
            });

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getRelateVideos(req: Request, res: Response) {
        const { auth } = req.local;
        const { video_id } = req.params;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const videoRepository = getRepository(Video);

        const video = await videoRepository.findOne(video_id, {
            select: ["id"],
            relations: ["categories"],
        });

        let relateVideosQueryBuilder = videoRepository
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .innerJoinAndSelect("videos.privacy", "privacies")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("videos.id <> :videoId", { videoId: video_id })
            .andWhere("videos.isBlocked IS FALSE")
            .andWhere("users.isBlocked IS FALSE")
            .andWhere(
                new Brackets((qb) => {
                    qb.where(`privacies.id = ${PUBLIC_ID}`);
                    if (auth) {
                        qb.orWhere("users.id = :userId", { userId: auth.id });
                    }
                }),
            )
            .skip(offset)
            .take(limit)
            .orderBy("videos.uploadedAt", "DESC");

        if (video.categories.length === 0) {
            relateVideosQueryBuilder = relateVideosQueryBuilder.andWhere("categories.id IS NULL");
        } else {
            relateVideosQueryBuilder = relateVideosQueryBuilder.andWhere(
                "categories.id IN (:...categoryIds)",
                {
                    categoryIds: video.categories.map((category) => category.id),
                },
            );
        }

        const relateVideos = await relateVideosQueryBuilder.getMany();

        res.status(200).json({
            data: relateVideos,
        });
    }

    @asyncHandler
    @isDateFormatIfExist("query.from")
    public async getVideoAnalysis(req: Request, res: Response) {
        const { video } = req.local;
        const from = req.query.from as string;
        const unit = req.query.unit || "day";

        expect(unit, "400:invalid unit").to.be.oneOf(["day", "month", "year"]);

        let dateFormat;
        switch (unit) {
            case "day":
                dateFormat = "'YYYY-MM-DD'";
                break;
            case "month":
                dateFormat = "'YYYY-MM'";
                break;
            case "year":
                dateFormat = "'YYYY'";
                break;
        }

        let viewsQueryBuilder = createQueryBuilder("video_views")
            .select("SUM(views)", "views")
            .addSelect(`TO_CHAR(date, ${dateFormat})`, "date")
            .where("video_id = :videoId", { videoId: video.id })
            .groupBy(`TO_CHAR(date, ${dateFormat})`)
            .orderBy("date");

        let commentsQueryBuilder = createQueryBuilder("comments")
            .select("COUNT(id)", "comments")
            .addSelect(`TO_CHAR(created_at, ${dateFormat})`, "date")
            .where("video_id = :videoId", { videoId: video.id })
            .groupBy(`TO_CHAR(created_at, ${dateFormat})`)
            .orderBy("date");

        let videoReactionsQueryBuilder = createQueryBuilder("video_likes")
            .select(`TO_CHAR(reacted_at, ${dateFormat})`, "date")
            .addSelect('SUM(CASE WHEN "like" THEN 1 ELSE 0 END)', "likes")
            .addSelect('SUM(CASE WHEN "like" THEN 0 ELSE 1 END)', "dislikes")
            .where("video_id = :videoId", { videoId: video.id })
            .groupBy(`TO_CHAR(reacted_at, ${dateFormat})`)
            .orderBy("date");

        if (from) {
            viewsQueryBuilder = viewsQueryBuilder.andWhere("date >= :from", {
                from: new Date(from),
            });
            commentsQueryBuilder = commentsQueryBuilder.andWhere("created_at >= :from", {
                from: new Date(from),
            });
            videoReactionsQueryBuilder = videoReactionsQueryBuilder.andWhere(
                "reacted_at >= :from",
                {
                    from: new Date(from),
                },
            );
        }

        const data = {
            comments: await commentsQueryBuilder.getRawMany(),
            views: await viewsQueryBuilder.getRawMany(),
            videoReactions: await videoReactionsQueryBuilder.getRawMany(),
        };

        res.status(200).json({ data: data });
    }
}

export default new VideoController();
