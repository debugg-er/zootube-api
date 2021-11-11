import * as express from "express";

import authController from "../controllers/auth_controller";

import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// login
router.post("/login", authController.login);

// logout
router.post("/logout", authMiddleware.authorize, authController.logout);

// register
router.post("/register", authController.register);

// reset password
router.post("/reset", authMiddleware.authorize, authController.changePassword);

// get login logs
router.get("/logs", authMiddleware.authorize, authController.getLoginLogs);

// delete login log by id
router.delete("/logs/:log_id(\\d+)", authMiddleware.authorize, authController.deleteDevice);

// delete all login log
router.delete("/logs", authMiddleware.authorize, authController.deleteAllOtherDevices);

export default router;
