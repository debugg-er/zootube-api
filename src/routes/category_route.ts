import * as express from "express";
import { getRepository } from "typeorm";
import { Category } from "../entities/Category";

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const categories = await getRepository(Category).find();

        res.status(200).json({
            data: categories,
        });

        //
    } catch (err) {
        next(err);
    }
});

export default router;
