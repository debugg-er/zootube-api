import * as express from "express";

import authController from "../controllers/auth_controller";

import authMiddleware from "../middlewares/auth_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// login
router.post("/login", authController.login);

// get login logs
router.get("/logs", authMiddleware.authorize, authController.getLoginLogs);

// logout
router.post("/logout", authMiddleware.authorize, authController.logout);

// register
router.post("/register", authController.register);

// reset password
router.post("/reset", authMiddleware.authorize, authController.changePassword);

export default router;
