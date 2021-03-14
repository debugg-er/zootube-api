declare module Express {
    interface Local {
        auth?: import("../../interfaces/user").IUserToken;
        video?: import("../../entities/Video").Video;
        comment?: import("../../entities/Comment").Comment;
    }

    interface Request {
        local: Local;
        files: import("../../interfaces/general").Files;
    }
}
