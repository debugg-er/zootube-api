import * as express from "express";
import * as morgan from "morgan";
import env from "./env";

import authRoute from "../routes/auth_route";
import videoRoute from "../routes/video_route";
import userRoute from "../routes/user_route";
import subscriptionRoute from "../routes/subscription_route";

import * as errorHandler from "../utils/error_handler";

const app: express.Application = express();

if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use((req, res, next) => {
    req.local = {};
    next();
});

app.use("/auth", authRoute);
app.use("/videos", videoRoute);
app.use("/users", userRoute);
app.use("/subscriptions", subscriptionRoute);

app.use("/auth", authRoute);
app.use(errorHandler.clientErrorHandler);
app.use(errorHandler.serverErrorHandler);

export default app;
