declare module Express {
    interface Local {
        auth?: import("../../interfaces/user").IUserToken;
    }

    interface Request {
        local: Local;
    }
}
