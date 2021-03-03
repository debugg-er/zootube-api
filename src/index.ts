import * as os from "os";
import * as cluster from "cluster";
import env from "./providers/env";

import server from "./server";

if (env.NODE_ENV === "production") {
    if (cluster.isMaster) {
        const cpus = os.cpus();
        cpus.forEach(() => cluster.fork());
    } else {
        server.init().then(() => {
            server.listen();
        });
    }
} else {
    server.init().then(() => {
        server.listen();
    });
}
