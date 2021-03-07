import * as fs from "fs";
import * as path from "path";
import * as request from "request-promise";
import * as sharp from "sharp";
import { NextFunction, Request, Response } from "express";
import { createQueryBuilder, getRepository } from "typeorm";
import { expect } from "chai";

import env from "../providers/env";
import { listRegex } from "../commons/regexs";
import asyncHandler from "../decorators/async_handler";
import { isBinaryIfExist, mustExistOne } from "../decorators/validate_decorators";
import { mustInRangeIfExist } from "../decorators/assert_decorators";
import { Subscription } from "../entities/Subscription";
import { Video } from "../entities/Video";
import { defaultAvatarPath, defaultIconPath, User } from "../entities/User";
import { randomString } from "../utils/string_function";

const tempPath = path.join(__dirname, "../../tmp");

class UserController {
    @asyncHandler
    public async getOwnProfile(req: Request, res: Response) {
        const { id } = req.local.auth;

        const user = await getRepository(User).findOne(id);

        const { totalSubscribers } = await createQueryBuilder("subscriptions")
            .select('COUNT(subscriber_id)::INT AS "totalSubscribers"')
            .where("user_id = :userId", { userId: id })
            .getRawOne();

        const { totalViews } = await createQueryBuilder("videos")
            .select('SUM(views)::INT AS "totalViews"')
            .where("uploaded_by = :userId", { userId: id })
            .getRawOne();

        delete user.password;
        delete user.tempPassword;

        res.status(200).json({
            data: {
                ...user,
                // totalViews and totalSubscribers may be null if there is no videos or subscribers
                totalViews: totalViews || 0,
                totalSubscribers: totalSubscribers || 0,
            },
        });
    }

    @asyncHandler
    public async getUserProfile(req: Request, res: Response) {
        const { username } = req.params;

        const user = await getRepository(User).findOne(
            { username: username },
            {
                select: [
                    "id",
                    "username",
                    "firstName",
                    "lastName",
                    "female",
                    "avatarPath",
                    "iconPath",
                ],
            },
        );

        const { totalSubscribers } = await createQueryBuilder("subscriptions")
            .select('COUNT(subscriber_id)::INT AS "totalSubscribers"')
            .where("user_id = :userId", { userId: user.id })
            .getRawOne();

        const { totalViews } = await createQueryBuilder("videos")
            .select('SUM(views)::INT AS "totalViews"')
            .where("uploaded_by = :userId", { userId: user.id })
            .getRawOne();

        res.status(200).json({
            data: {
                ...user,
                // totalViews and totalSubscribers may be null if there is no videos or subscribers
                totalViews: totalViews || 0,
                totalSubscribers: totalSubscribers || 0,
            },
        });
    }

    @asyncHandler
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getOwnVideos(req: Request, res: Response) {
        const { id } = req.local.auth;
        const categories = req.query.categories as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        if (categories) {
            expect(categories, "400:invalid parameter").to.match(listRegex);
        }

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ uploadedBy: id })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (categories) {
            videosQueryBuilder = videosQueryBuilder.andWhere(
                "categories.category IN (:...categories)",
                { categories: categories.split(",") },
            );
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getUserVideos(req: Request, res: Response) {
        const { username } = req.params;
        const categories = req.query.categories as string;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        if (categories) {
            expect(categories, "400:invalid parameter").to.match(listRegex);
        }

        const user = await getRepository(User).findOne({ username }, { select: ["id"] });

        let videosQueryBuilder = getRepository(Video)
            .createQueryBuilder("videos")
            .leftJoinAndSelect("videos.categories", "categories")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect(["users.username", "users.iconPath"])
            .where({ uploadedBy: user })
            .orderBy("videos.uploadedAt", "DESC")
            .skip(offset)
            .take(limit);

        // add additional where clause if categories are required
        if (categories) {
            videosQueryBuilder = videosQueryBuilder.andWhere(
                "categories.category IN (:...categories)",
                { categories: categories.split(",") },
            );
        }

        const videos = await videosQueryBuilder.getMany();

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
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
            .skip(offset)
            .take(limit)
            .getMany();

        const subscriptions = _subscriptions.map((subscription) => subscription.user);

        res.status(200).json({
            data: subscriptions,
        });
    }

    @asyncHandler
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
            .skip(offset)
            .take(limit)
            .getMany();

        const subscribers = _subscriptions.map((subscription) => subscription.subscriber);

        res.status(200).json({
            data: subscribers,
        });
    }

    @asyncHandler
    @mustExistOne("body.firstName", "body.lastName", "body.female", "files.avatar")
    @isBinaryIfExist("body.female")
    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        const { firstName, lastName, female } = req.body;
        const { avatar } = req.files;

        const userRepository = getRepository(User);

        const user = await userRepository.findOne(req.local.auth.id);

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;

        if (female !== undefined) {
            user.female = female === "1";
        }

        if (avatar) {
            expect(avatar.mimetype, "400:invalid file").to.match(/image/);

            const iconName = randomString(32) + ".jpg";
            const iconPath = path.join(tempPath, iconName);

            await sharp(avatar.path).resize(200).jpeg().toFile(iconPath);

            await request.post(env.STATIC_SERVER_ENDPOINT + "/photos", {
                formData: {
                    file: {
                        value: fs.createReadStream(avatar.path),
                        options: {
                            filename: avatar.name,
                            contentType: avatar.mimetype,
                        },
                    },
                },
            });
            await request.post(env.STATIC_SERVER_ENDPOINT + "/photos", {
                formData: {
                    file: {
                        value: fs.createReadStream(iconPath),
                        options: {
                            filename: iconName,
                            contentType: "image/jpeg",
                        },
                    },
                },
            });

            if (user.avatarPath !== defaultAvatarPath) {
                await request.delete(env.STATIC_SERVER_ENDPOINT + user.avatarPath);
            }
            if (user.iconPath !== defaultIconPath) {
                await request.delete(env.STATIC_SERVER_ENDPOINT + user.iconPath);
            }

            user.avatarPath = "/photos/" + avatar.name;
            user.iconPath = "/photos/" + iconName;

            await fs.promises.unlink(iconPath);
        }

        await userRepository.save(user);

        delete user.password;
        delete user.tempPassword;

        res.status(200).json({
            data: user,
        });

        next();
    }
}

export default new UserController();
