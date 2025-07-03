import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsResolvedColumn1635157042452 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE reports
            ADD COLUMN is_resolved BOOLEAN NOT NULL DEFAULT FALSE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE reports DROP COLUMN is_resolved`);
    }
}
