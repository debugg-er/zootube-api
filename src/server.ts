import * as http from "http";

import env from "./providers/env";
import application from "./providers/express";
import database from "./providers/database";

class Server {
    public httpServer: http.Server;

    public async init() {
        await database.createConnection();
        this.httpServer = http.createServer(application);
    }

    public listen() {
        this.httpServer.listen(env.PORT, () => {
            console.log("server listening on port " + env.PORT);
        });
    }
}

export default new Server();
