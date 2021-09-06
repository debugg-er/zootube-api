import { expect } from "chai";
import { Request, Response, NextFunction } from "express";

import asyncHander from "../decorators/async_handler";

class CheckMiddleware {
    @asyncHander
    public async checkVideoExist(req: Request, res: Response, next: NextFunction) {
        expect(req.local.video, "404:video not found").to.exist;
        next();
    }

    @asyncHander
    public async checkCommentExist(req: Request, res: Response, next: NextFunction) {
        expect(req.local.comment, "404:comment not found").to.exist;
        next();
    }

    @asyncHander
    public async checkCommentExistInVideo(req: Request, res: Response, next: NextFunction) {
        const { video, comment } = req.local;

        expect(video, "404:video not found").to.exist;
        expect(comment, "404:comment not found").to.exist;
        expect(comment.video.id === video.id, "404:comment is not belong to video").to.be.true;
        next();
    }

    @asyncHander
    public async checkUserExist(req: Request, res: Response, next: NextFunction) {
        expect(req.local.user, "404:user not found").to.exist;
        next();
    }
}

export default new CheckMiddleware();
