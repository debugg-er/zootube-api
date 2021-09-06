import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import asyncHander from "../decorators/async_handler";
import { Comment } from "../entities/Comment";
import { User } from "../entities/User";
import { Video } from "../entities/Video";

class FindMiddleware {
    @asyncHander
    public async findVideo(req: Request, res: Response, next: NextFunction) {
        req.local.video = await getRepository(Video)
            .createQueryBuilder("videos")
            .addSelect("videos.isBlocked")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.id", "users.username", "users.isBlocked"])
            .where("videos.id = :videoId", { videoId: req.params.video_id })
            .getOne();

        next();
    }

    @asyncHander
    public async findComment(req: Request, res: Response, next: NextFunction) {
        req.local.comment = await getRepository(Comment)
            .createQueryBuilder("comments")
            .innerJoin("comments.user", "users")
            .innerJoin("comments.video", "videos")
            .addSelect(["users.id", "users.username", "users.isBlocked"])
            .addSelect(["videos.id", "videos.isBlocked"])
            .where("comments.id = :commentId", { commentId: +req.params.comment_id })
            .getOne();

        next();
    }

    @asyncHander
    public async findUser(req: Request, res: Response, next: NextFunction) {
        req.local.user = await getRepository(User)
            .createQueryBuilder("users")
            .addSelect("users.isBlocked")
            .where("users.username = :username", { username: req.params.username })
            .getOne();

        next();
    }
}

export default new FindMiddleware();
