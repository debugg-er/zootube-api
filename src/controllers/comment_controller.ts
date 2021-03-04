import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import { mustExist } from "../decorators/validate_decorators";
import { mustInRange } from "../decorators/assert_decorators";
import { Comment } from "../entities/Comment";

class CommentController {
    @asyncHandler
    @mustExist("body.content")
    public async postComment(req: Request, res: Response) {
        const { video_id } = req.params;
        const { content } = req.body;
        const { id } = req.local.auth;

        const commentRepository = getRepository(Comment);

        const newComment = commentRepository.create({
            content: content,
            user: { id: id },
            video: { id: video_id },
        });

        await commentRepository.insert(newComment);

        res.status(201).json({
            data: newComment,
        });
    }

    @asyncHandler
    @mustExist("body.content")
    public async replyComment(req: Request, res: Response) {
        const { video_id } = req.params;
        const { content } = req.body;
        const { id } = req.local.auth;
        const comment_id = +req.params.comment_id;

        const commentRepository = getRepository(Comment);

        const comment = await commentRepository.findOne(
            { id: comment_id },
            { relations: ["parent"] },
        );
        expect(comment.parent, "400:nested comment is not allowed").to.be.null;

        const newComment = commentRepository.create({
            content: content,
            user: { id: id },
            video: { id: video_id },
            parent: { id: comment_id },
        });

        await commentRepository.insert(newComment);

        res.status(201).json({
            data: newComment,
        });
    }

    @asyncHandler
    @mustInRange("query.offset", 0, Infinity)
    @mustInRange("query.limit", 0, 100)
    public async getVideoComments(req: Request, res: Response) {
        const { video_id } = req.params;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const comments = await getRepository(Comment)
            .createQueryBuilder("comments")
            .leftJoin("comments.user", "users")
            .addSelect(["users.username", "users.iconPath"])
            .loadRelationCountAndMap("comments.totalReplies", "comments.comments")
            .where("comments.video_id = :videoId", { videoId: video_id })
            .andWhere("comments.parent_id IS NULL")
            .orderBy("comments.createdAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: comments,
        });
    }
}

export default new CommentController();
