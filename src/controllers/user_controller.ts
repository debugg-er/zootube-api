import { Request, Response } from "express";
import { createQueryBuilder, getRepository } from "typeorm";
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
    public async getOwnVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const videos = await getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ uploadedBy: id })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: videos,
        });
    }
}

export default new UserController();
