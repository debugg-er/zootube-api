import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";

import asyncHandler from "../decorators/async_handler";
import { Subscription } from "../entities/Subscription";
import { User } from "../entities/User";

class SubscriptioController {
    @asyncHandler
    public async subscribe(req: Request, res: Response) {
        const { username } = req.params;
        const { id } = req.local.auth;

        const user = await getRepository(User).findOne({ username: username }, { select: ["id"] });

        expect(user.id, "400:can't subscribe yourself").to.not.equal(id);

        const subscriptionRepository = getRepository(Subscription);

        const subscription = subscriptionRepository.create({
            userId: user.id,
            subscriberId: id,
        });

        await subscriptionRepository.save(subscription);

        res.status(201).json({
            data: { message: "subscribed" },
        });
    }

    @asyncHandler
    public async unsubscribe(req: Request, res: Response) {
        const { username } = req.params;
        const { id } = req.local.auth;

        const user = await getRepository(User).findOne({ username: username }, { select: ["id"] });

        await getRepository(Subscription).delete({
            userId: user.id,
            subscriberId: id,
        });

        res.status(200).json({
            data: { message: "unsubscribed" },
        });
    }
}

export default new SubscriptioController();
