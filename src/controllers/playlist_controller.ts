import { expect } from "chai";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { mustInRangeIfExist } from "../decorators/assert_decorators";

import asyncHandler from "../decorators/async_handler";
import { isNumberIfExist, mustExist, mustExistOne } from "../decorators/validate_decorators";
import { Playlist } from "../entities/Playlist";
import { PlaylistVideo } from "../entities/PlaylistVideo";
import { PRIVATE_ID } from "../entities/Privacy";
import { Video } from "../entities/Video";

class PlaylistController {
    @asyncHandler
    @mustExist("body.name")
    public async createPlaylist(req: Request, res: Response) {
        const { auth } = req.local;
        const { name } = req.body;
        const description = req.body.description || undefined;

        const playlist = getRepository(Playlist).create({
            name,
            description,
            createdBy: { id: auth.id },
        });
        await getRepository(Playlist).insert(playlist);

        res.status(201).json({
            data: playlist,
        });
    }

    @asyncHandler
    @mustExistOne("body.name", "body.description")
    public async updatePlaylist(req: Request, res: Response) {
        const { playlist } = req.local;
        const { name, description } = req.body;

        if (name !== undefined && name !== "") {
            playlist.name = name;
        }
        if (description !== undefined) {
            playlist.description = description;
        }
        await getRepository(Playlist).save(playlist);

        res.status(200).json({
            data: { message: "update playlist success" },
        });
    }

    @asyncHandler
    public async deletePlaylist(req: Request, res: Response) {
        const { playlist } = req.local;

        await getRepository(Playlist).delete({ id: playlist.id });

        res.status(200).json({
            data: { message: "deleted playlist" },
        });
    }

    @asyncHandler
    @mustExist("body.video_id")
    public async addVideoToPlaylist(req: Request, res: Response) {
        const { playlist } = req.local;
        const { video_id } = req.body;

        const videoCount = await getRepository(Video).count({ id: video_id });
        expect(videoCount, "404:video doesn't exist").to.equal(1);

        const playlistVideoCount = await getRepository(PlaylistVideo).count({
            playlistId: playlist.id,
            videoId: video_id,
        });
        expect(playlistVideoCount, "400:video already exist in playlist").to.equal(0);

        const playlistVideo = getRepository(PlaylistVideo).create({
            playlistId: playlist.id,
            videoId: video_id,
        });
        await getRepository(PlaylistVideo).insert(playlistVideo);

        res.status(201).json({
            data: playlistVideo,
        });
    }

    @asyncHandler
    @mustExist("body.video_id")
    public async removeVideoFromPlaylist(req: Request, res: Response) {
        const { playlist } = req.local;
        const { video_id } = req.body;

        const playlistVideoCount = await getRepository(PlaylistVideo).count({
            playlistId: playlist.id,
            videoId: video_id,
        });
        expect(playlistVideoCount, "404:video not in playlist").to.equal(1);

        await getRepository(PlaylistVideo).delete({
            playlistId: playlist.id,
            videoId: video_id,
        });

        res.status(200).json({
            data: { message: "removed video from playlist" },
        });
    }

    @asyncHandler
    public async getPlaylist(req: Request, res: Response) {
        const { playlist } = req.local;

        const _playlist = await getRepository(Playlist)
            .createQueryBuilder("playlists")
            .loadRelationCountAndMap("playlists.totalVideos", "playlists.playlistVideos")
            .innerJoin("playlists.createdBy", "users")
            .addSelect(["users.iconPath", "users.username", "users.firstName", "users.lastName"])
            .where({ id: playlist.id })
            .andWhere("users.isBlocked IS FALSE")
            .getOne();

        res.status(200).json({
            data: _playlist,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getPlaylistVideos(req: Request, res: Response) {
        const { playlist, auth } = req.local;
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const playlistVideos = await getRepository(PlaylistVideo)
            .createQueryBuilder("playlist_videos")
            .innerJoinAndSelect("playlist_videos.video", "videos")
            .addSelect("videos.isBlocked")
            .innerJoinAndSelect("videos.privacy", "privacies")
            .innerJoin("videos.uploadedBy", "users")
            .addSelect([
                "users.iconPath",
                "users.username",
                "users.firstName",
                "users.lastName",
                "users.isBlocked",
            ])
            .where({ playlistId: playlist.id })
            .orderBy("playlist_videos.addedAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        const videos = playlistVideos
            .map((playlistVideo) => ({
                ...playlistVideo.video,
                addedAt: playlistVideo.addedAt,
            }))
            .map((video) => {
                // nullify if don't have permission
                if (
                    video.privacy.id === PRIVATE_ID &&
                    (!auth || video.uploadedBy.username !== auth.username)
                ) {
                    return {
                        id: video.id,
                        addedAt: video.addedAt,
                        uploadedBy: video.uploadedBy,
                    };
                }
                // nullify if (video | video owner) was blocked
                if (video.uploadedBy.isBlocked || video.isBlocked) {
                    return {
                        id: video.id,
                        addedAt: video.addedAt,
                        uploadedBy: video.uploadedBy,
                    };
                }
                delete video.isBlocked;
                delete video.uploadedBy.isBlocked;
                return video;
            });

        res.status(200).json({
            data: videos,
        });
    }

    @asyncHandler
    @isNumberIfExist("query.offset", "query.limit")
    @mustInRangeIfExist("query.offset", 0, Infinity)
    @mustInRangeIfExist("query.limit", 0, 100)
    public async getPlaylists(req: Request, res: Response) {
        const offset = +req.query.offset || 0;
        const limit = +req.query.limit || 30;

        const playlists = await getRepository(Playlist)
            .createQueryBuilder("playlists")
            .loadRelationCountAndMap("playlists.totalVideos", "playlists.playlistVideos")
            .innerJoin("playlists.createdBy", "users")
            .addSelect(["users.iconPath", "users.username", "users.firstName", "users.lastName"])
            .andWhere("users.isBlocked IS FALSE")
            .orderBy("playlists.createdAt", "DESC")
            .skip(offset)
            .take(limit)
            .getMany();

        res.status(200).json({
            data: playlists,
        });
    }
}

export default new PlaylistController();
