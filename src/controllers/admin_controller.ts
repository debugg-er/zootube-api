import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { mustInRangeIfExist } from "../decorators/assert_decorators";
import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist, mustExist } from "../decorators/validate_decorators";
import { Report } from "../entities/Report";
import { User } from "../entities/User";
import { Video } from "../entities/Video";

class AdminController {
    @asyncHandler
    @mustExist("body.action")
    public async modifyVideo(req: Request, res: Response) {
        const { video } = req.local;
        const { action } = req.body;

        expect(action, "400:invalid action").to.be.oneOf(["ban", "unban"]);

        video.isBlocked = action === "ban";
        await getRepository(Video).save(video);
        if (action === "ban") {
            await getRepository(Report).update({ video: { id: video.id } }, { isResolved: true });
        }

        res.status(200).json({
            data: {
                message: "modify video success",
            },
        });
    }

    @asyncHandler
    @mustExist("body.action")
    public async modifyUser(req: Request, res: Response) {
        const { user } = req.local;
        const { action } = req.body;

        expect(action, "400:invalid action").to.be.oneOf(["ban", "unban"]);

        user.isBlocked = action === "ban";
        await getRepository(User).save(user);

        res.status(200).json({
            data: {
                message: "modify user success",
            },
        });
    }

    @asyncHandler
    @mustExist("query.status")
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getUsers(req: Request, res: Response) {
        const { status } = req.query;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        expect(status, "400:invalid user status").to.be.oneOf(["banned"]);

        let users: User[];

        if (status === "banned") {
            users = await getRepository(User)
                .createQueryBuilder("users")
                .where("users.isBlocked IS TRUE")
                .orderBy("users.joinedAt", "DESC")
                .skip(offset)
                .take(limit)
                .getMany();
        }

        res.status(200).json({
            data: users,
        });
    }

    @asyncHandler
    @mustExist("query.status")
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getVideos(req: Request, res: Response) {
        const { status } = req.query;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        expect(status, "400:invalid video status").to.be.oneOf(["banned"]);

        let videos: Video[];

        if (status === "banned") {
            videos = await getRepository(Video)
                .createQueryBuilder("videos")
                .innerJoinAndSelect("videos.privacy", "privacies")
                .innerJoin("videos.uploadedBy", "users")
                .addSelect([
                    "users.username",
                    "users.iconPath",
                    "users.firstName",
                    "users.lastName",
                ])
                .leftJoinAndSelect("videos.categories", "categories")
                .where("videos.isBlocked IS TRUE")
                .orderBy("videos.uploadedAt", "DESC")
                .skip(offset)
                .take(limit)
                .getMany();
        }

        res.status(200).json({
            data: videos,
        });
    }
}

export default new AdminController();
