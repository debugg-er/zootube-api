const fs = require("fs");
const request = require("request-promise");
const { takeRandomEleInArray, randomRange } = require("./util");
const { query } = require("./db");

const [, , baseUrl] = process.argv;
if (!baseUrl) throw new Error("missing argument");

const vietnameseCharacters =
    "ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ";

const nameRegex = new RegExp(`^(?! )[ a-zA-Z${vietnameseCharacters}]+(?<! )$`);

const googleApiKey = "AIzaSyDsjNTYmvYcFkQ6uEhoYY47bCNzBgqyZE4";

module.exports.createUser = async function (numUser) {
    let users = [];
    do {
        console.log("fetchng user data");
        const res = await request.get("https://randomuser.me/api?results=300", {
            json: true,
        });

        let _users = res.results.filter(
            (u) => nameRegex.test(u.name.first) && nameRegex.test(u.name.last),
        );

        users.push(..._users.slice(0, numUser - users.length));
    } while (users.length < numUser);

    const tokens = [];

    while (users.length > 0) {
        const regiss = users.splice(0, 50).map((u) =>
            request
                .post(baseUrl + "/auth/register", {
                    form: {
                        username: u.login.username,
                        password: "password",
                        first_name: u.name.first,
                        last_name: u.name.last,
                        female: u.gender === "female" ? "1" : "0",
                    },
                    json: true,
                })
                .then((res) => tokens.push(res.data.token))
                .catch((e) => console.log(e.message)),
        );
        const responses = await Promise.all(regiss);
    }

    return tokens;
};

async function createVideo({ publisher, users, videoPath, id, categories }) {
    const gRes = await request.get(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${id}&key=AIzaSyDsjNTYmvYcFkQ6uEhoYY47bCNzBgqyZE4`,
        { json: true },
    );

    const videoData = gRes.items[0];

    const { data: video } = await request.post(baseUrl + "/videos/", {
        formData: {
            video: fs.createReadStream(videoPath),
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            categories: categories,
        },
        headers: {
            Authorization: "Barear " + publisher,
        },
        json: true,
    });

    await query("UPDATE videos SET views = $1, uploaded_at = $2 WHERE id = $3", [
        ~~(videoData.statistics.viewCount / 100),
        new Date(videoData.snippet.publishedAt),
        video.id,
    ]);

    const likeCount = +videoData.statistics.likeCount;
    const dislikeCount = +videoData.statistics.dislikeCount;

    const reactors = takeRandomEleInArray(users, (likeCount + dislikeCount) % users.length);
    const ix = (likeCount / (likeCount + dislikeCount)) * reactors.length;
    const likeReactors = reactors.slice(0, ix);
    const dislikeReactors = reactors.slice(ix);

    if (likeReactors.length > 0) {
        await reactVideo({
            videoId: video.id,
            react: true,
            reactors: likeReactors,
        });
    }

    if (dislikeReactors.length > 0) {
        await reactVideo({
            videoId: video.id,
            react: false,
            reactors: dislikeReactors,
        });
    }

    return { video, videoData };
}

async function createReplies({ commentId, videoId, publishers, repliesData, n }) {
    const takenRepliesData = repliesData.slice(0, n);
    const creates = takenRepliesData.map(async (item) => {
        const [publisher] = takeRandomEleInArray(publishers, 1);
        if (item.snippet.textOriginal === "") return;
        const { data: reply } = await request.post(
            baseUrl + `/videos/${videoId}/comments/${commentId}`,
            {
                json: true,
                form: {
                    content: item.snippet.textOriginal.substring(0, 2000),
                },
                headers: {
                    Authorization: "Barear " + publisher,
                },
            },
        );

        await query("UPDATE comments SET created_at = $1 WHERE id = $2", [
            new Date(item.snippet.publishedAt),
            reply.id,
        ]);

        return reply;
    });

    return Promise.all(creates);
}

async function createComments({ id, videoId, publishers, n }) {
    let pageToken = "";

    const comments = [];
    let i = 1;

    do {
        let items;
        try {
            const gRes = await request.get(
                `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&maxResults=30&videoId=${id}&pageToken=${pageToken}&key=AIzaSyDsjNTYmvYcFkQ6uEhoYY47bCNzBgqyZE4`,
                { json: true },
            );
            pageToken = gRes.nextPageToken;
            items = gRes.items;
        } catch (err) {
            return;
        }

        const takenItems = items.slice(0, n - comments.length);
        for (const item of takenItems) {
            if (item.snippet.topLevelComment.snippet.textOriginal === "") continue;
            const [publisher] = takeRandomEleInArray(publishers, 1);
            const { data: comment } = await request.post(baseUrl + `/videos/${videoId}/comments`, {
                json: true,
                form: {
                    content: item.snippet.topLevelComment.snippet.textOriginal.substring(0, 2000),
                },
                headers: {
                    Authorization: "Barear " + publisher,
                },
            });

            await query("UPDATE comments SET created_at = $1 WHERE id = $2", [
                new Date(item.snippet.topLevelComment.snippet.publishedAt),
                comment.id,
            ]);

            const likeCount = item.snippet.topLevelComment.snippet.likeCount;
            const dislikeCount = randomRange(0, likeCount * 0.1);

            const reactors = takeRandomEleInArray(
                publishers,
                (likeCount + dislikeCount) % publishers.length,
            );
            const ix = (likeCount / (likeCount + dislikeCount)) * reactors.length;
            const likeReactors = reactors.slice(0, ix);
            const dislikeReactors = reactors.slice(ix);

            if (likeReactors.length > 0) {
                await reactComment({
                    videoId,
                    commentId: comment.id,
                    react: true,
                    reactors: likeReactors,
                });
            }
            if (dislikeReactors.length > 0) {
                await reactComment({
                    videoId,
                    commentId: comment.id,
                    react: false,
                    reactors: dislikeReactors,
                });
            }

            if (item.replies) {
                const replies = await createReplies({
                    commentId: comment.id,
                    videoId,
                    publishers,
                    repliesData: item.replies.comments,
                    n: item.replies.comments.length < 30 ? item.replies.comments.length : 30,
                });
            }
            comments.push(comment);
        }
    } while (comments.length < n && pageToken);

    return comments;
}

async function reactComment({ videoId, commentId, reactors, react }) {
    while (reactors.length > 0) {
        const l = reactors.splice(0, 20);

        const doReacts = l.map((i) =>
            request.post(baseUrl + `/videos/${videoId}/comments/${commentId}/reaction`, {
                form: {
                    reaction: react ? "like" : "dislike",
                },
                headers: {
                    Authorization: "Barear " + i,
                },
            }),
        );
        await Promise.all(doReacts);
    }
}

async function reactVideo({ videoId, reactors, react }) {
    while (reactors.length > 0) {
        const l = reactors.splice(0, 50);

        const doReacts = l.map((i) =>
            request.post(baseUrl + `/videos/${videoId}/reaction`, {
                form: {
                    reaction: react ? "like" : "dislike",
                },
                headers: {
                    Authorization: "Barear " + i,
                },
            }),
        );
        await Promise.all(doReacts);
    }
}

module.exports.createVideo = async function ({ publisher, users, videoPath, categories }) {
    const [id] = videoPath.replace(/^.*[\\\/]/, "").split(".");

    const { video, videoData } = await createVideo({
        id,
        publisher,
        users,
        videoPath,
        categories: categories.join(","),
    });

    const comments = await createComments({
        id,
        videoId: video.id,
        publishers: users,
        n: videoData.statistics.commentCount % users.length,
    });
};
