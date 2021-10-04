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
router.get("/me/profile", authController.authorize, userController.getOwnProfile);

// get own videos
router.get("/me/videos", authController.authorize, userController.getOwnVideos);

// get own playlist
router.get("/me/playlists", authController.authorize, userController.getOwnPlaylists);

// get own subscription users
router.get("/me/subscriptions", authController.authorize, userController.getOwnSubscriptions);

// get own subscriber
router.get("/me/subscribers", authController.authorize, userController.getOwnSubscribers);

// update user
router.patch(
    "/me",
    authController.authorize,
    multipartMiddleware.storeUploadFiles("avatar", "banner"),
    userController.updateProfile,
);

// get user videos
router.get(
    "/:username/videos",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserVideos,
);

// get user subscriptions
router.get(
    "/:username/subscriptions",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserSubscriptions,
);

// get user subscribers
router.get(
    "/:username/subscribers",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserSubscribers,
);

// get user profile
router.get(
    "/:username/profile",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserProfile,
);

// get user playlist
router.get(
    "/:username/playlists",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserPlaylists,
);

export default router;
