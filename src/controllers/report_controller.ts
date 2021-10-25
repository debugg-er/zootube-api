import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { mustInRangeIfExist } from "../decorators/assert_decorators";
import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist, mustExist } from "../decorators/validate_decorators";
import { Report } from "../entities/Report";
import { Video } from "../entities/Video";

class ReportController {
    @asyncHandler
    @mustExist("body.video_id", "body.reason")
    public async createVideoReport(req: Request, res: Response) {
        const { auth } = req.local;
        const { video_id, reason } = req.body;

        const videoCount = await getRepository(Video).count({ id: video_id });
        expect(videoCount, "404:video not found").to.equal(1);

        const report = getRepository(Report).create({
            reason: reason,
            video: { id: video_id },
            user: { id: auth.id },
        });

        await getRepository(Report).save(report);
        res.status(201).json({
            data: report,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getReportedVideo(req: Request, res: Response) {
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const videos = await getRepository(Video)
            .createQueryBuilder("videos")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .innerJoinAndSelect("videos.privacy", "privacies")
            .innerJoinAndSelect("videos.reports", "reports")
            .innerJoin("reports.user", "reporters")
            .addSelect([
                "reporters.username",
                "reporters.iconPath",
                "reporters.firstName",
                "reporters.lastName",
            ])
            .leftJoinAndSelect("videos.categories", "categories")
            .where("videos.isBlocked IS FALSE")
            .andWhere("users.isBlocked IS FALSE")
            .skip(offset)
            .take(limit)
            .orderBy("reports.createdAt", "DESC")
            .getMany();

        res.status(200).json({
            data: videos,
        });
    }
}

export default new ReportController();
