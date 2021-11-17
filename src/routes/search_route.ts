import * as express from "express";

import searchController from "../controllers/search_controller";

import authMiddleware from "../middlewares/auth_middleware"

const router = express.Router();

// search videos
router.get("/videos", authMiddleware.authorizeIfGiven, searchController.searchVideos);

// search users
router.get("/users", searchController.searchUsers);

// search playlists
router.get("/playlists", searchController.searchPlaylists);

export default router;
