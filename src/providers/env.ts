import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// prettier-ignore
export default {
    PORT:                   parseInt(process.env.PORT)          || 8080,
    DB_PORT:                parseInt(process.env.DB_PORT)       || 5432,
    DB_HOST:                process.env.DB_HOST                 || "127.0.0.1",
    DB_USERNAME:            process.env.DB_USERNAME             || "postgres",
    DB_PASSWORD:            process.env.DB_PASSWORD             || null,
    DB_NAME:                process.env.DB_NAME                 || "test",
    SALT_ROUND:             parseInt(process.env.SALT_ROUND)    || 10,
    JWT_SECRET:             process.env.JWT_SECRET              || "secret",
    JWT_EXPIRE_TIME:        process.env.JWT_EXPIRE_TIME         || "7d",
    MEDIA_SERVER_ENDPOINT:  process.env.MEDIA_SERVER_ENDPOINT,
    NODE_ENV:               process.env.NODE_ENV                || "production",
    REDIS_HOST:             process.env.REDIS_HOST              || '127.0.0.1',
    REDIS_PORT:             parseInt(process.env.REDIS_PORT)    || 6379,
    REDIS_PASSWORD:         process.env.REDIS_PASSWORD,
};
