declare module Express {
    interface Local {}

    interface Request {
        local: Local;
    }
}
