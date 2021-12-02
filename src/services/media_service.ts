import * as fs from "fs";
import * as request from "request-promise";

import env from "../providers/env";
import { File } from "../interfaces/general";

export class MediaServiceError extends Error {
    constructor(message: string) {
        super(message);
    }
}

class MediaService {
    public async processVideo(
        video: string,
        thumbnailTimestamp?: number,
    ): Promise<{ videoPath: string; thumbnailPath: string; duration: number }> {
        try {
            const { data } = await request.patch(env.MEDIA_SERVER_ENDPOINT + "/videos/" + video, {
                json: true,
                form: {
                    seek: ~~thumbnailTimestamp,
                },
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body.fail.message);
        }
    }

    public async processBanner(photo: File): Promise<{ bannerPath: string }> {
        try {
            const { data } = await request.post(env.MEDIA_SERVER_ENDPOINT + "/banners", {
                json: true,
                formData: {
                    banner: {
                        value: fs.createReadStream(photo.path),
                        options: {
                            filename: photo.name,
                            contentType: photo.mimetype,
                        },
                    },
                },
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body);
        }
    }

    public async processAvatar(photo: File): Promise<{ avatarPath: string; iconPath: string }> {
        try {
            const { data } = await request.post(env.MEDIA_SERVER_ENDPOINT + "/avatars", {
                json: true,
                formData: {
                    avatar: {
                        value: fs.createReadStream(photo.path),
                        options: {
                            filename: photo.name,
                            contentType: photo.mimetype,
                        },
                    },
                },
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body);
        }
    }

    public async processThumbnail(photo: File): Promise<{ thumbnailPath: string }> {
        try {
            const { data } = await request.post(env.MEDIA_SERVER_ENDPOINT + "/thumbnails", {
                json: true,
                formData: {
                    thumbnail: {
                        value: fs.createReadStream(photo.path),
                        options: {
                            filename: photo.name,
                            contentType: photo.mimetype,
                        },
                    },
                },
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body);
        }
    }

    public async deleteVideo(videoName: string): Promise<void> {
        await request.delete(env.MEDIA_SERVER_ENDPOINT + "/videos/" + videoName);
    }

    public async deletePhoto(photoName: string): Promise<void> {
        await request.delete(env.MEDIA_SERVER_ENDPOINT + "/photos/" + photoName);
    }

    public async deleteThumbnail(thumbnailName: string): Promise<void> {
        await request.delete(env.MEDIA_SERVER_ENDPOINT + "/thumbnails/" + thumbnailName);
    }
}

export default new MediaService();
