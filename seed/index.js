const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const _fs = require("fs");
const { pool } = require("./db");
const { promises: fs } = require("fs");
const { createUser, createVideo } = require("./function");
const { checkPercentage, takeRandomEleInArray } = require("./util");

if (!process.argv[3]) throw new Error("missing argument");
const seedDir = path.resolve(process.cwd(), process.argv[3]);

const template = JSON.parse(_fs.readFileSync(seedDir + "/template.json"));

const categories = [
    "Trò chơi",
    "Hài hước",
    "Phim ảnh",
    "Du lịch",
    "Thức ăn",
    "Thể thao",
    "Công nghệ",
    "Âm nhạc",
    "Hoạt hình",
    "Tự nhiên",
];

async function handleVideos(publishers, users) {
    for (let i = 0; i < template.length; i++) {
        console.log(template.length - i + "LEFT");
        const l = template[i];

        const vidDir = path.resolve(seedDir, l.dir);
        const files = await fs.readdir(vidDir);

        console.log("WORKING WITH " + l.name);
        for (const file of files) {
            const cs = [];
            for (const category of categories) {
                if (checkPercentage(l.categories[category])) {
                    cs.push(category);
                }
            }

            const [publisher] = takeRandomEleInArray(publishers, 1);

            console.log("uploading " + file + "...");
            await createVideo({
                publisher: publisher,
                users: users,
                videoPath: path.resolve(seedDir, l.dir, file),
                categories: cs,
            });
            console.log("uploading " + file + " done !!");
        }
    }
    console.log("reach the end");
    pool.end();
}

async function main() {
    console.log("creating users...");
    const tokens = await createUser(200);
    console.log("create user done !!");

    await handleVideos(tokens.slice(0, 30), tokens);
}

main().catch(console.log);
