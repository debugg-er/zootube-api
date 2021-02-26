import * as express from "express";
import authController from "../controllers/auth_controller";

import videoController from "../controllers/video_controller";
import identifyMiddleware from "../middlewares/identify_middleware";
import multipart_middleware from "../middlewares/multipart_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
    "/",
    authController.authorize,
    multipart_middleware.storeUploadFiles,
    videoController.uploadVideo,
    multipart_middleware.removeUploadedFiles,
);

router.delete(
    "/:video_id(\\w{10})",
    authController.authorize,
    identifyMiddleware.isOwnVideo,
    videoController.deleteVideo,
);

export default router;
