import { Request, Response } from "express";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist } from "../decorators/validate_decorators";
import { mustInRangeIfExist } from "../decorators/assert_decorators";
import { WatchedVideo } from "../entities/WatchedVideo";

class HistoryController {
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
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where({ userId: id })
            .andWhere("videos.isBlocked IS FALSE")
            .andWhere("users.isBlocked IS FALSE")
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
    public async deleteWatchedVideos(req: Request, res: Response) {
        const user = req.local.auth;

        await getRepository(WatchedVideo).delete({ userId: user.id });

        res.status(200).json({
            data: { message: "deleted history" },
        });
    }
}

export default new HistoryController();
