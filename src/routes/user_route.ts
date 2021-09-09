import * as express from "express";

import authController from "../controllers/auth_controller";
import userController from "../controllers/user_controller";

import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";
import multipartMiddleware from "../middlewares/multipart_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get own profile
router.get("/profile", authController.authorize, userController.getOwnProfile);

// get own videos
router.get("/videos", authController.authorize, userController.getOwnVideos);

// get subscription users
router.get("/subscriptions", authController.authorize, userController.getSubscriptions);

// get subscriber
router.get("/subscribers", authController.authorize, userController.getSubscribers);

// get user videos
router.get(
    "/:username/videos",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserVideos,
);

// get user profile
router.get(
    "/:username/profile",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserProfile,
);

// update user
router.patch(
    "/",
    authController.authorize,
    multipartMiddleware.storeUploadFiles("avatar", "banner"),
    userController.updateProfile,
);

export default router;
