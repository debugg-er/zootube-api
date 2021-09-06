import * as express from "express";

import authController from "../controllers/auth_controller";
import commentController from "../controllers/comment_controller";

import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";

const router = express.Router({ mergeParams: true });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get(
    "/",
    authController.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    commentController.getVideoComments,
);

router.get(
    "/:comment_id(\\d+)",
    authController.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    commentController.getCommentReplies,
);

router.post(
    "/",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    commentController.postComment,
);

router.post(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    commentController.replyComment,
);

router.post(
    "/:comment_id(\\d+)/reaction",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    commentController.reactComment,
);

router.delete(
    "/:comment_id(\\d+)/reaction",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    commentController.deleteCommentReaction,
);

router.patch(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    identifyMiddleware.isOwnComment,
    commentController.updateComment,
);

router.delete(
    "/:comment_id(\\d+)",
    authController.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    identifyMiddleware.isOwnComment,
    commentController.deleteComment,
);

export default router;
