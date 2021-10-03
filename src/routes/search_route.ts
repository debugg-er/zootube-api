import * as express from "express";

import searchController from "../controllers/search_controller";
import authController from "../controllers/auth_controller";

const router = express.Router();

// search videos
router.get("/videos", authController.authorizeIfGiven, searchController.searchVideos);

// search users
router.get("/users", searchController.searchUsers);

export default router;
