import * as express from "express";

import reportController from "../controllers/report_controller";

import authMiddleware from "../middlewares/auth_middleware"
import checkMiddleware from "../middlewares/check_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// report video
router.post("/", authMiddleware.authorize, reportController.createVideoReport);

// get reported video
router.get(
    "/videos",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    reportController.getReportedVideo,
);

// modify report
router.patch(
    "/:report_id(\\d+)",
    authMiddleware.authorize,
    checkMiddleware.checkAuthorizedUserIsAdmin,
    reportController.modifyReport,
);

export default router;
