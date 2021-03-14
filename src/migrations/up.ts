import * as fs from "fs";
import * as path from "path";
import db from "../providers/database";

const queries = fs
    .readFileSync(path.join(__dirname, "../../up.sql"), "utf8")
    .split(";")
    .filter((query) => query?.length);

(async () => {
    await db.createConnection();

    for (const query of queries) {
        await db.connection.manager.query(query.trim());
    }

    await db.connection.close();
})();
