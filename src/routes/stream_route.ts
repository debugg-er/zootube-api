import * as express from "express";

import streamController from "../controllers/stream_controller";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get streams
router.get("/", streamController.getStreams);

// get stream
router.get("/:stream_id(\\w{10})", streamController.getStream);

// update stream status with stream_key (live or off)
// Note: this route should be filtered by webserver
// and only allow stream-server to request locally
router.patch("/:stream_id(\\w{10})", streamController.updateStreamStatus);

export default router;
