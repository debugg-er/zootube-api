import * as express from "express";

import searchController from "../controllers/search_controller";

const router = express.Router();

// search videos
router.get("/videos", searchController.searchVideos);

// search users
router.get("/users", searchController.searchUsers);

export default router;
