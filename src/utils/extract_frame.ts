import * as ffmpeg from "fluent-ffmpeg";

interface ScreenshotConfig {
    dest: string;
    height: number;
    seek: number;
}

export default function extractFrame(input: string, option: ScreenshotConfig) {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .setStartTime(option.seek)
            .frames(1)
            .withSize("?x" + option.height)
            .on("end", resolve)
            .on("err", reject)
            .saveToFile(option.dest);
    });
}
