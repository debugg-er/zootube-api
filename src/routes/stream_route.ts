import * as express from "express";

import streamController from "../controllers/stream_controller";
import authController from "../controllers/auth_controller";

import multipartMiddleware from "../middlewares/multipart_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get streams
router.get("/", streamController.getStreams);

// get stream
router.get("/:stream_id(\\w{10})", streamController.getStream);

// get authorized user stream
router.get("/me", authController.authorize, streamController.getOwnStream);

// update authorized user stream
router.patch(
    "/me",
    authController.authorize,
    multipartMiddleware.storeUploadFiles("thumbnail"),
    streamController.updateStreamInfo,
);

// update stream status with stream_key (live or off)
// Note: this route should be filtered by webserver
// and only allow stream-server to request locally
router.patch("/:stream_id(\\w{10})", streamController.updateStreamStatus);

export default router;
