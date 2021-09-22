import * as FileType from "file-type";
import { NextFunction, Request, Response } from "express";
import { createQueryBuilder, getRepository } from "typeorm";
import { expect } from "chai";

import mediaService from "../services/media_service";
import asyncHandler from "../decorators/async_handler";
import { isBinaryIfExist, isNumberIfExist, mustExistOne } from "../decorators/validate_decorators";
import { mustInRangeIfExist } from "../decorators/assert_decorators";
import { Subscription } from "../entities/Subscription";
import { Video } from "../entities/Video";
import { User } from "../entities/User";
import extractFilenameFromPath from "../utils/extract_filename_from_path";
import { Playlist } from "../entities/Playlist";

class UserController {
    @asyncHandler
    public async getOwnProfile(req: Request, res: Response) {
        const { id } = req.local.auth;

        const user = await getRepository(User).findOne(id);

        const { totalSubscribers } = await createQueryBuilder("subscriptions")
            .select('COALESCE(COUNT(subscriber_id), 0) AS "totalSubscribers"')
            .where("user_id = :userId", { userId: id })
            .getRawOne();

        const { totalViews } = await createQueryBuilder("videos")
            .select('COALESCE(SUM(views), 0) AS "totalViews"')
            .where("uploaded_by = :userId", { userId: id })
            .getRawOne();

        res.status(200).json({
            data: {
                ...user,
                totalViews: +totalViews,
                totalSubscribers: +totalSubscribers,
            },
        });
    }

    @asyncHandler
    public async getUserProfile(req: Request, res: Response) {
        const { user } = req.local;
        delete user.isBlocked;

        const { totalSubscribers } = await createQueryBuilder("subscriptions")
            .select('COALESCE(COUNT(subscriber_id), 0) AS "totalSubscribers"')
            .where("user_id = :userId", { userId: user.id })
            .getRawOne();

        const { totalViews } = await createQueryBuilder("videos")
            .select('COALESCE(SUM(views), 0) AS "totalViews"')
            .where("uploaded_by = :userId", { userId: user.id })
            .getRawOne();

        res.status(200).json({
            data: {
                ...user,
                totalViews: +totalViews,
                totalSubscribers: +totalSubscribers,
            },
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getOwnVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const category = req.query.category as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .addSelect("videos.isBlocked")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where({ uploadedBy: id })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (category) {
            videosQueryBuilder = videosQueryBuilder.andWhere("categories.category = :category", {
                category: category,
            });
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getUserVideos(req: Request, res: Response) {
        const { user } = req.local;
        const category = req.query.category as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where({ uploadedBy: user })
            .andWhere("videos.isBlocked IS FALSE")
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (category) {
            videosQueryBuilder = videosQueryBuilder.andWhere("categories.category = :category", {
                category: category,
            });
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getSubscriptions(req: Request, res: Response) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const _subscriptions = await getRepository(Subscription)
            .createQueryBuilder("subscriptions")
            .leftJoin("subscriptions.user", "users")
            .addSelect(["users.username", "users.firstName", "users.lastName", "users.iconPath"])
            .where("subscriptions.subscriber = :userId", { userId: id })
            .andWhere("users.isBlocked IS FALSE")
            .orderBy("subscriptions.subscribedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        const subscriptions = _subscriptions.map((subscription) => ({
            ...subscription.user,
            subscribedAt: subscription.subscribedAt,
        }));

        res.status(200).json({
            data: subscriptions,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getSubscribers(req: Request, res: Response) {
        const { id } = req.local.auth;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const _subscriptions = await getRepository(Subscription)
            .createQueryBuilder("subscriptions")
            .leftJoin("subscriptions.subscriber", "subscribers")
            .addSelect([
                "subscribers.username",
                "subscribers.firstName",
                "subscribers.lastName",
                "subscribers.iconPath",
            ])
            .where("subscriptions.user = :userId", { userId: id })
            .orderBy("subscriptions.subscribedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        const subscribers = _subscriptions.map((subscription) => ({
            ...subscription.subscriber,
            subscribedAt: subscription.subscribedAt,
        }));

        res.status(200).json({
            data: subscribers,
        });
    }

    @asyncHandler
    @mustExistOne(
        "body.first_name",
        "body.last_name",
        "body.female",
        "files.avatar",
        "files.banner",
    )
    @isBinaryIfExist("body.female")
    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        const { first_name, last_name, female } = req.body;
        const { avatar, banner } = req.files;

        if (avatar) {
            const avatarType = await FileType.fromFile(avatar.path);
            expect(avatarType.ext, "400:invalid file").to.be.oneOf(["jpg", "png"]);
        }
        if (banner) {
            const bannerType = await FileType.fromFile(banner.path);
            expect(bannerType.ext, "400:invalid file").to.be.oneOf(["jpg", "png"]);
        }

        const userRepository = getRepository(User);
        const user = await userRepository.findOne(req.local.auth.id);

        user.firstName = first_name || user.firstName;
        user.lastName = last_name || user.lastName;
        if (female !== undefined) {
            user.female = female === "1";
        }

        // stop handle when user contain invalid property
        user.validate();

        if (avatar) {
            const { avatarPath, iconPath } = await mediaService.processAvatar(avatar);
            if (user.avatarPath !== null) {
                await mediaService.deletePhoto(extractFilenameFromPath(user.avatarPath));
            }
            if (user.iconPath !== null) {
                await mediaService.deletePhoto(extractFilenameFromPath(user.iconPath));
            }

            user.avatarPath = avatarPath;
            user.iconPath = iconPath;
        }

        if (banner) {
            const { bannerPath } = await mediaService.processBanner(banner);
            if (user.bannerPath !== null) {
                await mediaService.deletePhoto(extractFilenameFromPath(user.bannerPath));
            }

            user.bannerPath = bannerPath;
        }

        await userRepository.save(user);

        res.status(200).json({
            data: user,
        });

        next();
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getOwnPlaylists(req: Request, res: Response) {
        const { auth } = req.local;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const playlists = await getRepository(Playlist)
            .createQueryBuilder("playlists")
            .leftJoin("playlists.createdBy", "users")
            .loadRelationCountAndMap("playlists.totalVideos", "playlists.playlistVideos")
            .addSelect(["users.username", "users.firstName", "users.lastName", "users.iconPath"])
            .where({ createdBy: auth.id })
            .orderBy("playlists.createdAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: playlists,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getUserPlaylists(req: Request, res: Response) {
        const { username } = req.params;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const playlists = await getRepository(Playlist)
            .createQueryBuilder("playlists")
            .leftJoin("playlists.createdBy", "users")
            .loadRelationCountAndMap("playlists.totalVideos", "playlists.playlistVideos")
            .addSelect(["users.username", "users.firstName", "users.lastName", "users.iconPath"])
            .where("users.username = :username", { username: username })
            .orderBy("playlists.createdAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: playlists,
        });
    }
}

export default new UserController();
