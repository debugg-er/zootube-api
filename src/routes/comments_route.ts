import * as express from "express";

import authController from "../controllers/auth_controller";
import commentController from "../controllers/comment_controller";

import findMiddleware from "../middlewares/find_middleware";

const router = express.Router({ mergeParams: true });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post(
    "/",
    authController.authorize,
    findMiddleware.isVideoExist,
    commentController.postComment,
);

router.post(
    "/:comment_id",
    authController.authorize,
    findMiddleware.isVideoExist,
    findMiddleware.isCommentExist,
    commentController.replyComment,
);

export default router;
