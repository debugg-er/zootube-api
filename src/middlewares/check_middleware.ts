import { expect } from "chai";
import { Request, Response, NextFunction } from "express";

import { ADMIN } from "../entities/Role";
import asyncHander from "../decorators/async_handler";
import { PRIVATE_ID, PUBLIC_ID } from "../entities/Privacy";

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

    @asyncHander
    public async checkUserIsNotBlocked(req: Request, res: Response, next: NextFunction) {
        expect(req.local.user.isBlocked, "405:user was blocked").to.be.false;
        next();
    }

    @asyncHander
    public async checkVideoIsNotBlocked(req: Request, res: Response, next: NextFunction) {
        expect(req.local.video.isBlocked, "405:video was blocked").to.be.false;
        next();
    }

    @asyncHander
    public async checkVideoOwnerIsNotBlocked(req: Request, res: Response, next: NextFunction) {
        expect(req.local.video.uploadedBy.isBlocked, "405:video owner was blocked").to.be.false;
        next();
    }

    @asyncHander
    public async checkCommentOwnerIsNotBlocked(req: Request, res: Response, next: NextFunction) {
        expect(req.local.comment.user.isBlocked, "405:comment owner was blocked").to.be.false;
        next();
    }

    @asyncHander
    public async checkAuthorizedUserIsAdmin(req: Request, res: Response, next: NextFunction) {
        expect(req.local.auth.role, "403:permission denied").to.equal(ADMIN);
        next();
    }

    @asyncHander
    public async checkUserIsNotAdmin(req: Request, res: Response, next: NextFunction) {
        expect(req.local.user.role.name, "403:permission denied").to.not.equal(ADMIN);
        next();
    }

    @asyncHander
    public async checkVideoOwnerIsNotAdmin(req: Request, res: Response, next: NextFunction) {
        expect(req.local.video.uploadedBy.role.name, "403:permission denied").to.not.equal(ADMIN);
        next();
    }

    @asyncHander
    public async checkPlaylistExist(req: Request, res: Response, next: NextFunction) {
        expect(req.local.playlist, "404:playlist not found").to.exist;
        next();
    }

    @asyncHander
    public async checkPlaylistOwnerIsNotBlocked(req: Request, res: Response, next: NextFunction) {
        expect(req.local.playlist.createdBy.isBlocked, "405:playlist owner was blocked").to.be
            .false;
        next();
    }

    @asyncHander
    public async checkVideoPrivacy(req: Request, res: Response, next: NextFunction) {
        const { video, auth } = req.local;
        expect(
            (video.privacy.id === PRIVATE_ID && auth && video.uploadedBy.id === auth.id) ||
                video.privacy.id === PUBLIC_ID,
            "403:permission denied",
        ).to.be.true;
        next();
    }
}

export default new CheckMiddleware();
