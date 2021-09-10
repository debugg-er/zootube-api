import { MigrationInterface, QueryRunner } from "typeorm";

export class playlist1631256198465 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE playlists (
            id SERIAL PRIMARY KEY,
            name VARCHAR(128) NOT NULL,
            description VARCHAR(5000),
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_by int NOT NULL,
            FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        )`);

        const _1000000To9999999 = ~~(Math.random() * 9000000) + 1000000;
        await queryRunner.query(
            `ALTER SEQUENCE playlists_id_seq RESTART WITH ${_1000000To9999999}`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE playlists`);
    }
}
