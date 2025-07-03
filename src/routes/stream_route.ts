import * as express from "express";

import streamController from "../controllers/stream_controller";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get streams
router.get("/", streamController.getStreams);

// get stream
router.get("/:stream_id(\\w{10})", streamController.getStream);

// Note: these endpoit under this line should be filtered by webserver
// and only allow stream-server to request locally

// update stream status with stream_key (live or off)
router.patch("/:stream_id(\\w{10})", streamController.updateStreamStatus);

// upload streamed video
router.post("/", streamController.uploadStreamedVideo);

export default router;
