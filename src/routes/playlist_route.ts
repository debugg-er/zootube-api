import * as express from "express";

import authController from "../controllers/auth_controller";
import playlistController from "../controllers/playlist_controller";

import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get playlist
router.get(
    "/:playlist_id(\\d+)",
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    checkMiddleware.checkPlaylistOwnerIsNotBlocked,
    playlistController.getPlaylist,
);

// get playlist videos
router.get(
    "/:playlist_id(\\d+)/videos",
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    checkMiddleware.checkPlaylistOwnerIsNotBlocked,
    playlistController.getPlaylistVideos,
);

// create playlist
router.post("/", authController.authorize, playlistController.createPlaylist);

// add video to playlists
router.post(
    "/:playlist_id(\\d+)/videos",
    authController.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.addVideoToPlaylist,
);

// update playlist
router.patch(
    "/:playlist_id(\\d+)",
    authController.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.updatePlaylist,
);

// delete playlist
router.delete(
    "/:playlist_id(\\d+)",
    authController.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.deletePlaylist,
);

// remove video from playlist
router.delete(
    "/:playlist_id(\\d+)/videos",
    authController.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.removeVideoFromPlaylist,
);

export default router;
