import * as express from "express";

import searchController from "../controllers/search_controller";

const router = express.Router();

router.get("/videos", searchController.searchVideos);
router.get("/users", searchController.searchUsers);

export default router;
