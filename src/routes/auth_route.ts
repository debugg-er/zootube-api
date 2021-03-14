import * as express from "express";

import authController from "../controllers/auth_controller";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/reset", authController.authorize, authController.changePassword);

export default router;
