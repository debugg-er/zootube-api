import * as express from "express";

import authController from "../controllers/auth_controller";
import commentController from "../controllers/comment_controller";

import findMiddleware from "../middlewares/find_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";

const router = express.Router({ mergeParams: true });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get(
    "/",
    authController.authorizeIfGiven,
    findMiddleware.isVideoExist,
    commentController.getVideoComments,
);

router.get(
    "/:comment_id(\\d+)",
    authController.authorizeIfGiven,
    findMiddleware.isCommentExistInVideo,
    commentController.getCommentReplies,
);

router.post(
    "/",
    authController.authorize,
    findMiddleware.isVideoExist,
    commentController.postComment,
);

router.post(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.isCommentExistInVideo,
    commentController.replyComment,
);

router.post(
    "/:comment_id(\\d+)/reaction",
    authController.authorize,
    findMiddleware.isCommentExistInVideo,
    commentController.reactComment,
);

router.delete(
    "/:comment_id(\\d+)/reaction",
    authController.authorize,
    findMiddleware.isCommentExistInVideo,
    commentController.deleteCommentReaction,
);

router.patch(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.isCommentExistInVideo,
    identifyMiddleware.isOwnComment,
    commentController.updateComment,
);

router.delete(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.isCommentExistInVideo,
    identifyMiddleware.isOwnComment,
    commentController.deleteComment,
);

export default router;
