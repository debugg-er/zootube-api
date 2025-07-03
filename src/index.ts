import server from "./server";

server.init().then(() => {
    server.listen();
});
