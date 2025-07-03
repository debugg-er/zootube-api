import * as express from "express";

import commentController from "../controllers/comment_controller";

import authMiddleware from "../middlewares/auth_middleware"
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";

const router = express.Router({ mergeParams: true });

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get comments
router.get(
    "/",
    authMiddleware.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    commentController.getVideoComments,
);

// get replies
router.get(
    "/:comment_id(\\d+)",
    authMiddleware.authorizeIfGiven,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    checkMiddleware.checkCommentOwnerIsNotBlocked,
    commentController.getCommentReplies,
);

// comment
router.post(
    "/",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    commentController.postComment,
);

// reply comment
router.post(
    "/:comment_id(\\d+)",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    checkMiddleware.checkCommentOwnerIsNotBlocked,
    commentController.replyComment,
);

// react comment
router.post(
    "/:comment_id(\\d+)/reaction",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    checkMiddleware.checkCommentOwnerIsNotBlocked,
    commentController.reactComment,
);

// delete comment reaction
router.delete(
    "/:comment_id(\\d+)/reaction",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    commentController.deleteCommentReaction,
);

// update own comment
router.patch(
    "/:comment_id(\\d+)",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    checkMiddleware.checkVideoIsNotBlocked,
    checkMiddleware.checkVideoOwnerIsNotBlocked,
    checkMiddleware.checkVideoPrivacy,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    identifyMiddleware.isOwnComment,
    commentController.updateComment,
);

// delete comment
router.delete(
    "/:comment_id(\\d+)",
    authMiddleware.authorize,
    findMiddleware.findVideo,
    checkMiddleware.checkVideoExist,
    findMiddleware.findComment,
    checkMiddleware.checkCommentExist,
    checkMiddleware.checkCommentExistInVideo,
    identifyMiddleware.isOwnCommentOrOwnVideo,
    commentController.deleteComment,
);

export default router;
