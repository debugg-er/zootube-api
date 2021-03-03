import { expect } from "chai";
import { Request, Response } from "express";
import { createQueryBuilder, getRepository } from "typeorm";
import { listRegex } from "../commons/regexs";
import { mustInRange } from "../decorators/assert_decorators";
import asyncHandler from "../decorators/async_handler";
import { User } from "../entities/User";
import { Video } from "../entities/Video";

class UserController {
    @asyncHandler
    public async getOwnProfile(req: Request, res: Response) {
        const { id } = req.local.auth;

        const user = await getRepository(User).findOne(id);

        const { totalSubscribers } = await createQueryBuilder("subscriptions")
            .select('COUNT(subscriber_id)::INT AS "totalSubscribers"')
            .where("user_id = :userId", { userId: id })
            .getRawOne();

        const { totalViews } = await createQueryBuilder("videos")
            .select('SUM(views)::INT AS "totalViews"')
            .where("uploaded_by = :userId", { userId: id })
            .getRawOne();

        delete user.password;
        delete user.tempPassword;

        res.status(200).json({
            data: {
                ...user,
                // totalViews and totalSubscribers may be null if there is no videos or subscribers
                totalViews: totalViews || 0,
                totalSubscribers: totalSubscribers || 0,
            },
        });
    }

    @asyncHandler
    @mustInRange("query.offset", 0, Infinity)
    @mustInRange("query.limit", 0, 100)
    public async getOwnVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const categories = req.query.categories as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        if (categories) {
            expect(categories, "400:invalid parameter").to.match(listRegex);
        }

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ uploadedBy: id })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (categories) {
            videosQueryBuilder = videosQueryBuilder.andWhere(
                "categories.category IN (:...categories)",
                { categories: categories.split(",") },
            );
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @mustInRange("query.offset", 0, Infinity)
    @mustInRange("query.limit", 0, 100)
    public async getUserVideos(req: Request, res: Response) {
        const { username } = req.params;
        const categories = req.query.categories as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        if (categories) {
            expect(categories, "400:invalid parameter").to.match(listRegex);
        }

        const user = await getRepository(User).findOne({ username }, { select: ["id"] });

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ uploadedBy: user })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (categories) {
            videosQueryBuilder = videosQueryBuilder.andWhere(
                "categories.category IN (:...categories)",
                { categories: categories.split(",") },
            );
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }
}

export default new UserController();
