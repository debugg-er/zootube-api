import * as express from "express";

import historyController from "../controllers/history_controller";
import authController from "../controllers/auth_controller";

const router = express.Router();

// get watched videos
router.get("/", authController.authorize, historyController.getWatchedVideos);

// clear watch history
router.delete("/", authController.authorize, historyController.deleteWatchedVideos);

export default router;
