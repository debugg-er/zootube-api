import * as express from "express";

import subscriptionController from "../controllers/subscription_controller";
import authController from "../controllers/auth_controller";

import findMiddleware from "../middlewares/find_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
    "/:username",
    authController.authorize,
    findMiddleware.isUserExist,
    subscriptionController.subscribe,
);

router.delete(
    "/:username",
    authController.authorize,
    findMiddleware.isUserExist,
    subscriptionController.unsubscribe,
);

export default router;
