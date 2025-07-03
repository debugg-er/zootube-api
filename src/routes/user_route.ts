import * as express from "express";

import userController from "../controllers/user_controller";

import authMiddleware from "../middlewares/auth_middleware";
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get own profile
router.get("/me/profile", authMiddleware.authorize, userController.getOwnProfile);

// get own videos
router.get("/me/videos", authMiddleware.authorize, userController.getOwnVideos);

// get own playlist
router.get("/me/playlists", authMiddleware.authorize, userController.getOwnPlaylists);

// get own subscription users
router.get("/me/subscriptions", authMiddleware.authorize, userController.getOwnSubscriptions);

// get own subscriber
router.get("/me/subscribers", authMiddleware.authorize, userController.getOwnSubscribers);

// get authorized user stream
router.get("/me/stream", authMiddleware.authorize, userController.getOwnStream);

// update authorized user stream
router.patch("/me/stream", authMiddleware.authorize, userController.updateStreamInfo);

// update user
router.patch("/me", authMiddleware.authorize, userController.updateProfile);

// get user stream
router.get(
    "/:username/stream",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserStream,
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

// get user statistic
router.get(
    "/:username/statistic",
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotBlocked,
    userController.getUserStatistic,
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
