import { expect } from "chai";
import { NextFunction, Request, Response } from "express";

import asyncHandler from "../decorators/async_handler";

class IdentifyMiddleware {
    @asyncHandler
    public async isOwnVideo(req: Request, res: Response, next: NextFunction) {
        const { video, auth } = req.local;

        expect(video.uploadedBy.id, "400:video doesn't belong to you").to.equal(auth.id);
        next();
    }

    @asyncHandler
    public async isOwnComment(req: Request, res: Response, next: NextFunction) {
        const { comment, auth } = req.local;

        expect(comment.user.id, "400:comment doesn't belong to you").to.equal(auth.id);
        next();
    }

    @asyncHandler
    public async isOwnCommentOrOwnVideo(req: Request, res: Response, next: NextFunction) {
        const { comment, video, auth } = req.local;

        expect(auth.id, "400:permission denined").to.be.oneOf([
            comment.user.id,
            video.uploadedBy.id,
        ]);
        next();
    }

    @asyncHandler
    public async isOwnPlaylist(req: Request, res: Response, next: NextFunction) {
        const { playlist, auth } = req.local;

        expect(playlist.createdBy.id, "400:playlist doesn't belong to you").to.equal(auth.id);
        next();
    }
}

export default new IdentifyMiddleware();
