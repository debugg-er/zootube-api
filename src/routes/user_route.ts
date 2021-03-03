import * as express from "express";

import authController from "../controllers/auth_controller";
import userController from "../controllers/user_controller";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/profile", authController.authorize, userController.getOwnProfile);
router.get("/videos", authController.authorize, userController.getOwnVideos);
router.get("/:username/videos", userController.getUserVideos);

export default router;
