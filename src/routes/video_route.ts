import * as express from "express";

import authController from "../controllers/auth_controller";
import videoController from "../controllers/video_controller";

import identifyMiddleware from "../middlewares/identify_middleware";
import multipartMiddleware from "../middlewares/multipart_middleware";
import findMiddleware from "../middlewares/find_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/:video_id(\\w{10})", authController.authorizeIfGiven, videoController.getVideo);

router.get("/subscription", authController.authorize, videoController.getSubscriptionVideos);
router.get("/watched", authController.authorize, videoController.getSubscriptionVideos);

router.post(
    "/:video_id(\\w{10})/reaction",
    authController.authorize,
    findMiddleware.isVideoExist,
    videoController.reactVideo,
);
router.delete(
    "/:video_id(\\w{10})/reaction",
    authController.authorize,
    findMiddleware.isVideoExist,
    videoController.deleteVideoReaction,
);

router.post(
    "/",
    authController.authorize,
    multipartMiddleware.storeUploadFiles("video"),
    videoController.uploadVideo,
    multipartMiddleware.removeUploadedFiles,
);

router.patch(
    "/:video_id(\\w{10})",
    authController.authorize,
    identifyMiddleware.isOwnVideo,
    multipartMiddleware.storeUploadFiles("thumbnail"),
    videoController.updateVideo,
    multipartMiddleware.removeUploadedFiles,
);

router.delete(
    "/:video_id(\\w{10})",
    authController.authorize,
    identifyMiddleware.isOwnVideo,
    videoController.deleteVideo,
);

export default router;
