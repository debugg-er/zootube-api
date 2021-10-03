import { MigrationInterface, QueryRunner } from "typeorm";

export class privacy1633248175164 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE privacies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(32) NOT NULL
        )`);
        await queryRunner.query(
            `INSERT INTO privacies VALUES (1, 'public'), (2, 'private'), (3, 'subscriber')`,
        );

        await queryRunner.query(`ALTER TABLE videos ADD COLUMN privacy_id INT NULL`);
        await queryRunner.query(`UPDATE videos SET privacy_id = 1`);
        await queryRunner.query(`ALTER TABLE videos ALTER COLUMN privacy_id SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE videos
            ADD CONSTRAINT fk_videos_privacies
            FOREIGN KEY (privacy_id) REFERENCES privacies(id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE videos DROP CONSTRAINT fk_videos_privacies`);
        await queryRunner.query(`ALTER TABLE videos DROP COLUMN privacy_id`);
        await queryRunner.query(`DROP TABLE privacies`);
    }
}
