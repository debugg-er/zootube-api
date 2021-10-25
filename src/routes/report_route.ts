import * as express from "express";

import reportController from "../controllers/report_controller";
import authController from "../controllers/auth_controller";

import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// report video
router.post("/", authController.authorize, reportController.createVideoReport);

// get reported video
router.get(
    "/",
    authController.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    reportController.getReportedVideo,
);

export default router;
