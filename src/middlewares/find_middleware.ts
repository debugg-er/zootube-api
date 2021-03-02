import { expect } from "chai";
import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";

import asyncHander from "../decorators/async_handler";
import { Video } from "../entities/Video";

class FindMiddleware {
    @asyncHander
    public async isVideoExist(req: Request, res: Response, next: NextFunction) {
        const { video_id } = req.params;

        const countVideo = await getRepository(Video).count({ id: video_id });
        expect(countVideo, "404:video not found").to.equal(1);

        next();
    }
}

export default new FindMiddleware();
