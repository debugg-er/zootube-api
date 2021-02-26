import * as ffmpeg from "fluent-ffmpeg";

export default function extractFrame(input: string, option: ffmpeg.ScreenshotsConfig) {
    return new Promise((resolve, reject) => {
        ffmpeg(input).on("end", resolve).on("err", reject).screenshot(option);

    });
}
