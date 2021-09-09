import * as express from "express";

import authController from "../controllers/auth_controller";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// login
router.post("/login", authController.login);

// register
router.post("/register", authController.register);

// reset password
router.post("/reset", authController.authorize, authController.changePassword);

export default router;
