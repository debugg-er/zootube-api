declare module Express {
    interface Local {
        auth?: import("../../interfaces/user").IUserToken;
        video?: import("../../entities/Video").Video;
        comment?: import("../../entities/Comment").Comment;
        user?: import("../../entities/User").User;
        playlist?: import("../../entities/Playlist").Playlist;
        tempFilePaths: string[];
    }

    interface Request {
        local: Local;
        files: import("../../interfaces/general").Files;
    }
}
