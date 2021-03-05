import { expect } from "chai";
import { NextFunction, Request, Response } from "express";
import { getRepository } from "typeorm";
import asyncHandler from "../decorators/async_handler";
import { Comment } from "../entities/Comment";
import { Video } from "../entities/Video";

class IdentifyMiddleware {
    @asyncHandler
    public async isOwnVideo(req: Request, res: Response, next: NextFunction) {
        const { video_id } = req.params;
        const { id } = req.local.auth;

        const video = await getRepository(Video).findOne({
            id: video_id,
            uploadedBy: { id },
        });

        expect(video, "400:video doesn't exist or belong someone else").to.exist;

        req.local.video = video;
        next();
    }

    @asyncHandler
    public async isOwnComment(req: Request, res: Response, next: NextFunction) {
        const { id } = req.local.auth;
        const comment_id = +req.params.comment_id;

        const comment = await getRepository(Comment).findOne({
            id: comment_id,
            user: { id },
        });

        expect(comment, "400:comment doesn't exist or belong someone else").to.exist;

        req.local.comment = comment;
        next();
    }
}

export default new IdentifyMiddleware();
