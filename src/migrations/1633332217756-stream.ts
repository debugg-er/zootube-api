import { MigrationInterface, QueryRunner } from "typeorm";
import { randomString } from "../utils/string_function";

function generateStreamIds(length: number): Array<string> {
    let streamIds = [];
    while (streamIds.length < length) {
        const id = randomString(10);
        if (streamIds.indexOf(id) === -1) {
            streamIds.push(id);
        }
    }
    return streamIds;
}

export class stream1633332217756 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(` CREATE TABLE streams (
            id CHAR(10) PRIMARY KEY,
            stream_key CHAR(32) NOT NULL,
            name VARCHAR(128) NOT NULL,
            thumbnail_path VARCHAR(128),
            is_streaming BOOLEAN NOT NULL DEFAULT FALSE,
            user_id INT NOT NULL UNIQUE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);

        const users = await queryRunner.query("SELECT * FROM users");
        const streamIds = generateStreamIds(users.length);

        for (let i = 0; i < users.length; i++) {
            await queryRunner.query(
                `INSERT INTO streams(id, stream_key, name, user_id)
                    VALUES ($1, $2, $3, $4)`,
                [streamIds[i], randomString(32), users[i].username + " Stream!", users[i].id],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE streams`);
    }
}
