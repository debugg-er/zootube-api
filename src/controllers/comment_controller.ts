import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import { mustExist } from "../decorators/validate_decorators";
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
}

export default new CommentController();
