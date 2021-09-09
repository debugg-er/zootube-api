import { MigrationInterface, QueryRunner } from "typeorm";

export class alterViewsDatatype1631153869274 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE videos ALTER COLUMN views TYPE BIGINT ");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE videos ALTER COLUMN views TYPE INT ");
    }
}
