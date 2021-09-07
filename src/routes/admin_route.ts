import * as express from "express";

import adminController from "../controllers/admin_controller";
import authController from "../controllers/auth_controller";

import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// modify video
router.patch(
    "/videos/:video_id(\\w{10})",
    authController.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoOwnerIsNotAdmin,
    adminController.modifyVideo,
);

// modify user
router.patch(
    "/users/:username",
    authController.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    findMiddleware.findUser,
    checkMiddleware.checkUserExist,
    checkMiddleware.checkUserIsNotAdmin,
    adminController.modifyUser,
);

// get videos
router.get(
    "/videos",
    authController.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    adminController.getVideos,
);

// get users
router.get(
    "/users",
    authController.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    adminController.getUsers,
);

export default router;
