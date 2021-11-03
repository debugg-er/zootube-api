import * as express from "express";

import playlistController from "../controllers/playlist_controller";

import authMiddleware from "../middlewares/auth_middleware"
import findMiddleware from "../middlewares/find_middleware";
import checkMiddleware from "../middlewares/check_middleware";
import identifyMiddleware from "../middlewares/identify_middleware";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// get playlists
router.get("/", playlistController.getPlaylists);

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
    authMiddleware.authorizeIfGiven,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    checkMiddleware.checkPlaylistOwnerIsNotBlocked,
    playlistController.getPlaylistVideos,
);

// create playlist
router.post("/", authMiddleware.authorize, playlistController.createPlaylist);

// add video to playlists
router.post(
    "/:playlist_id(\\d+)/videos",
    authMiddleware.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.addVideoToPlaylist,
);

// update playlist
router.patch(
    "/:playlist_id(\\d+)",
    authMiddleware.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.updatePlaylist,
);

// delete playlist
router.delete(
    "/:playlist_id(\\d+)",
    authMiddleware.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.deletePlaylist,
);

// remove video from playlist
router.delete(
    "/:playlist_id(\\d+)/videos",
    authMiddleware.authorize,
    findMiddleware.findPlaylist,
    checkMiddleware.checkPlaylistExist,
    identifyMiddleware.isOwnPlaylist,
    playlistController.removeVideoFromPlaylist,
);

export default router;
