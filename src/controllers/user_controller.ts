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
import { PUBLIC_ID } from "../entities/Privacy";
import { Stream, STREAM_KEY_LENGTH } from "../entities/Stream";
import { randomString } from "../utils/string_function";

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
            .innerJoinAndSelect("videos.privacy", "privacies")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where({ uploadedBy: user })
            .andWhere("videos.isBlocked IS FALSE")
            .andWhere(`privacies.id = ${PUBLIC_ID}`)
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
    public async getOwnSubscriptions(req: Request, res: Response) {
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
    public async getUserSubscriptions(req: Request, res: Response) {
        const { username } = req.params;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const _subscriptions = await getRepository(Subscription)
            .createQueryBuilder("subscriptions")
            .leftJoin("subscriptions.user", "users")
            .addSelect(["users.username", "users.firstName", "users.lastName", "users.iconPath"])
            .innerJoin("subscriptions.subscriber", "subscribers")
            .where("subscribers.username = :username", { username: username })
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
    public async getOwnSubscribers(req: Request, res: Response) {
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
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getUserSubscribers(req: Request, res: Response) {
        const { username } = req.params;
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
            .innerJoin("subscriptions.user", "users")
            .where("users.username = :username", { username: username })
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

    @asyncHandler
    public async getUserStream(req: Request, res: Response) {
        const { username } = req.params;

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .innerJoin("streams.user", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("users.username = :username", { username: username })
            .getOne();

        // Doesn't need to check if exists
        // expect(stream, "404:stream not found").to.exist;

        res.status(200).json({
            data: stream,
        });
    }

    @asyncHandler
    public async getOwnStream(req: Request, res: Response) {
        const { auth } = req.local;

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .addSelect("streams.streamKey")
            .innerJoin("streams.user", "users")
            .addSelect(["users.username", "users.iconPath", "users.firstName", "users.lastName"])
            .where("users.id = :userId", { userId: auth.id })
            .getOne();

        // Doesn't need to check if exists
        // expect(stream, "404:stream not found").to.exist;

        res.status(200).json({
            data: stream,
        });
    }

    @asyncHandler
    @mustExistOne("body.name", "files.thumbnail", "body.renew_key", "body.description")
    @isBinaryIfExist("body.renew_key")
    public async updateStreamInfo(req: Request, res: Response, next: NextFunction) {
        const { auth } = req.local;
        const { thumbnail } = req.files;
        const { name, description } = req.body;
        const renew_key = req.body.renew_key === "1";

        if (thumbnail) {
            const thumbnailType = await FileType.fromFile(thumbnail.path);
            expect(thumbnailType.ext, "400:invalid thumbnail").to.be.oneOf(["jpg", "png"]);
        }

        const stream = await getRepository(Stream)
            .createQueryBuilder("streams")
            .addSelect("streams.streamKey")
            .innerJoin("streams.user", "users")
            .where("users.id = :userId", { userId: auth.id })
            .getOne();

        if (renew_key) stream.streamKey = randomString(STREAM_KEY_LENGTH);
        if (name) stream.name = name;
        if (description) stream.description = description;

        if (thumbnail) {
            const { thumbnailPath } = await mediaService.processThumbnail(thumbnail);
            if (stream.thumbnailPath !== null) {
                await mediaService.deleteThumbnail(extractFilenameFromPath(stream.thumbnailPath));
            }
            stream.thumbnailPath = thumbnailPath;
        }

        await getRepository(Stream).save(stream);

        res.status(200).json({
            data: stream,
        });
        next();
    }
}

export default new UserController();
