import * as express from "express";

import historyController from "../controllers/history_controller";

import authMiddleware from "../middlewares/auth_middleware"

const router = express.Router();

// get watched videos
router.get("/", authMiddleware.authorize, historyController.getWatchedVideos);

// clear watch history
router.delete("/", authMiddleware.authorize, historyController.deleteWatchedVideos);

export default router;
