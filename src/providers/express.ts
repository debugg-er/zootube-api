import * as express from "express";

import authRoute from "../routes/auth_route";

import * as errorHandler from "../utils/error_handler";

const app: express.Application = express();

app.use((req, res, next) => {
    req.local = {};
    next();
});

app.use("/auth", authRoute);

app.use(errorHandler.clientErrorHandler);
app.use(errorHandler.serverErrorHandler);

export default app;
