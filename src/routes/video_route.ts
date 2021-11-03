import * as express from "express";

import commentRoute from "./comments_route";

import videoController from "../controllers/video_controller";

import authMiddleware from "../middlewares/auth_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";
import multipartMiddleware from "../middlewares/multipart_middleware";
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.use("/:video_id(\\w{10})/comments", commentRoute);

// get subscription videos
router.get("/subscription", authMiddleware.authorize, videoController.getSubscriptionVideos);

// get liked videos
router.get("/liked", authMiddleware.authorize, videoController.getLikedVideos);

// get home videos
router.get("/", authMiddleware.authorizeIfGiven, videoController.getVideos);

// get relate videos
router.get(
    "/:video_id(\\w{10})/relate",
    authMiddleware.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    videoController.getRelateVideos,
);

// get video
router.get(
    "/:video_id(\\w{10})",
    authMiddleware.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkBlockedVideoPermission,
    checkMiddleware.checkBlockedVideoOwnerPermission,
    checkMiddleware.checkVideoPrivacy,
    videoController.getVideo,
);

// get video analysis
router.get(
    "/:video_id(\\w{10})/analysis",
    authMiddleware.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    identifyMiddleware.isOwnVideo,
    videoController.getVideoAnalysis,
);

// react video
router.post(
    "/:video_id(\\w{10})/reaction",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    videoController.reactVideo,
);

// delete video reaction
router.delete(
    "/:video_id(\\w{10})/reaction",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    videoController.deleteVideoReaction,
);

// upload video
router.post(
    "/",
    authMiddleware.authorize,
    multipartMiddleware.storeUploadFiles("video"),
    videoController.uploadVideo,
);

// update video
router.patch(
    "/:video_id(\\w{10})",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    identifyMiddleware.isOwnVideo,
    multipartMiddleware.storeUploadFiles("thumbnail"),
    videoController.updateVideo,
);

// delete video
router.delete(
    "/:video_id(\\w{10})",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    identifyMiddleware.isOwnVideo,
    videoController.deleteVideo,
);

export default router;
