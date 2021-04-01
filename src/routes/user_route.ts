import * as express from "express";

import authController from "../controllers/auth_controller";
import userController from "../controllers/user_controller";

import multipartMiddleware from "../middlewares/multipart_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/profile", authController.authorize, userController.getOwnProfile);
router.get("/videos", authController.authorize, userController.getOwnVideos);
router.get("/subscriptions", authController.authorize, userController.getSubscriptions);
router.get("/subscribers", authController.authorize, userController.getSubscribers);

router.get("/:username/videos", userController.getUserVideos);
router.get("/:username/profile", userController.getUserProfile);

router.patch(
    "/",
    authController.authorize,
    multipartMiddleware.storeUploadFiles("avatar", "banner"),
    userController.updateProfile,
);

export default router;
