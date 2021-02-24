import * as path from "path";
import { Connection, createConnection } from "typeorm";
import env from "./env";

class Database {
    public connection: Connection;

    public async createConnection(): Promise<void> {
        this.connection = await createConnection({
            type: "postgres",
            host: env.DB_HOST,
            port: env.DB_PORT,
            username: env.DB_USERNAME,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            synchronize: false,
            logging: ["query"],
            entities: [path.join(__dirname, "../entities/*.ts")],
        });
    }
}

export default new Database();
