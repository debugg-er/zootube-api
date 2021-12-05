import * as request from "request-promise";

import env from "../providers/env";

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

    public async processBanner(photo: string): Promise<{ bannerPath: string }> {
        try {
            const { data } = await request.patch(env.MEDIA_SERVER_ENDPOINT + "/banners/" + photo, {
                json: true,
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body.fail.message);
        }
    }

    public async processAvatar(photo: string): Promise<{ avatarPath: string; iconPath: string }> {
        try {
            const { data } = await request.patch(env.MEDIA_SERVER_ENDPOINT + "/avatars/" + photo, {
                json: true,
            });
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body.fail.message);
        }
    }

    public async processThumbnail(photo: string): Promise<{ thumbnailPath: string }> {
        try {
            const { data } = await request.patch(
                env.MEDIA_SERVER_ENDPOINT + "/thumbnails/" + photo,
                {
                    json: true,
                },
            );
            return data;
        } catch (err) {
            throw new MediaServiceError(err.response.body.fail.message);
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
