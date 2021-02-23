import * as express from "express";

import * as errorHandler from "../utils/error_handler";

const app: express.Application = express();

app.use(errorHandler.clientErrorHandler);
app.use(errorHandler.serverErrorHandler);

export default app;
