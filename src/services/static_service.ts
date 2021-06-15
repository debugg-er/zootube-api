import * as fs from "fs";
import * as request from "request-promise";

import env from "../providers/env";
import { File } from "../interfaces/general";

class StaticService {
    public async postVideo(video: File): Promise<void> {
        await request.post(env.STATIC_SERVER_ENDPOINT + "/videos", {
            formData: {
                file: {
                    value: fs.createReadStream(video.path),
                    options: {
                        filename: video.name,
                        contentType: video.mimetype,
                    },
                },
            },
        });
    }

    public async postPhoto(photo: File): Promise<void> {
        await request.post(env.STATIC_SERVER_ENDPOINT + "/photos", {
            formData: {
                file: {
                    value: fs.createReadStream(photo.path),
                    options: {
                        filename: photo.name,
                        contentType: photo.mimetype,
                    },
                },
            },
        });
    }

    public async postThumbnail(thumbnail: File): Promise<void> {
        await request.post(env.STATIC_SERVER_ENDPOINT + "/thumbnails", {
            formData: {
                file: {
                    value: fs.createReadStream(thumbnail.path),
                    options: {
                        filename: thumbnail.name,
                        contentType: thumbnail.mimetype,
                    },
                },
            },
        });
    }

    public async deleteVideo(videoName: string): Promise<void> {
        await request.delete(env.STATIC_SERVER_ENDPOINT + "/videos/" + videoName);
    }

    public async deletePhoto(photoName: string): Promise<void> {
        await request.delete(env.STATIC_SERVER_ENDPOINT + "/photos/" + photoName);
    }

    public async deleteThumbnail(thumbnailName: string): Promise<void> {
        await request.delete(env.STATIC_SERVER_ENDPOINT + "/thumbnails/" + thumbnailName);
    }
}

export default new StaticService();
