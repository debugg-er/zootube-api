import * as express from "express";

import subscriptionController from "../controllers/subscription_controller";

import authMiddleware from "../middlewares/auth_middleware"
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// subscribe user
router.post(
    "/:username",
    authMiddleware.authorize,
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    subscriptionController.subscribe,
);

// unsubscribe user
router.delete(
    "/:username",
    authMiddleware.authorize,
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    subscriptionController.unsubscribe,
);

export default router;
