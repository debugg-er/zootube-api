import * as express from "express";

import adminController from "../controllers/admin_controller";

import authMiddleware from "../middlewares/auth_middleware";
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// modify video
router.patch(
    "/videos/:video_id(\\w{10})",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    adminController.modifyVideo,
);

// modify user
router.patch(
    "/users/:username",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    adminController.modifyUser,
);

// get videos
router.get(
    "/videos",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    adminController.getVideos,
);

// get users
router.get(
    "/users",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    adminController.getUsers,
);

export default router;
