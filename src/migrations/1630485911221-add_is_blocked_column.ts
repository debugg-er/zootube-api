import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsBlockedColumn1630485911221 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users
            ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE
        `);
        await queryRunner.query(`ALTER TABLE videos
            ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT FALSE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE videos DROP COLUMN is_blocked`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN is_blocked`);
    }
}
