// import * as os from 'os';
// import * as cluster from 'cluster';

// import server from './server';

// if (cluster.isMaster) {
//     const cpus = os.cpus();
//     cpus.forEach(() => cluster.fork());
//     cluster.fork();
// } else {
//     server.init().then(() => {
//         server.listen();
//     });
// }

import server from "./server";

server.init().then(() => {
    server.listen();
});
