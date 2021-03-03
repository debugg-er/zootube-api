import { ffprobe } from "fluent-ffmpeg";

export default function (videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffprobe(videoPath, (err, metadata) => {
            if (err) reject(err);
            resolve(metadata.format.duration);
        });
    });
}
