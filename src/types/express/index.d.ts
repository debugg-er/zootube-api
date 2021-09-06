declare module Express {
    interface Local {
        auth?: import("../../interfaces/user").IUserToken;
        video?: import("../../entities/Video").Video;
        comment?: import("../../entities/Comment").Comment;
        user?: import("../../entities/User").User;
        tempFilePaths: string[];
    }

    interface Request {
        local: Local;
        files: import("../../interfaces/general").Files;
    }
}
