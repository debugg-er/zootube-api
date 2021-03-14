import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";

import { Video } from "../entities/Video";
import asyncHandler from "../decorators/async_handler";
import { isDateFormatIfExist, isNumberIfExist, mustExist } from "../decorators/validate_decorators";
import { mustInRangeIfExist } from "../decorators/assert_decorators";

class SearchController {
    @asyncHandler
    @mustExist("query.q")
    @isDateFormatIfExist("query.max_upload_date")
    @isNumberIfExist("query.offset", "query.limit", "query.min_duration")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async searchVideos(req: Request, res: Response, next: NextFunction) {
        const q = req.query.q as string;
        const max_upload_date = req.query.max_upload_date as string;
        const min_duration = req.query.min_duration as string;
        const category = req.query.category as string;
        const sort = req.query.sort as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        let videoQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where("LOWER(title) LIKE :q", { q: `%${q.toLowerCase()}%` })
            .skip(offset)
            .take(limit);

        if (min_duration) {
            videoQueryBuilder = videoQueryBuilder.andWhere("videos.duration <= :minDuration", {
                minDuration: +min_duration,
            });
        }

        if (max_upload_date) {
            videoQueryBuilder = videoQueryBuilder.andWhere("videos.uploadedAt >= :maxUploadDate", {
                maxUploadDate: new Date(max_upload_date),
            });
        }

        if (category) {
            videoQueryBuilder = videoQueryBuilder.andWhere("categories.category = :category", {
                category: category,
            });
        }

        switch (sort) {
            case "views":
                videoQueryBuilder = videoQueryBuilder.orderBy("videos.views", "DESC");
                break;
            default:
                videoQueryBuilder = videoQueryBuilder.orderBy("videos.uploadedAt", "DESC");
                break;
        }

        const videos = await videoQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }
}

export default new SearchController();
