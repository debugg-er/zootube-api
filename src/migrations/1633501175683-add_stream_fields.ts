import { MigrationInterface, QueryRunner } from "typeorm";

export class addStreamFields1633501175683 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE streams ADD COLUMN description VARCHAR(5000)");
        await queryRunner.query("ALTER TABLE streams ADD COLUMN last_streamed_at TIMESTAMP");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE streams DROP COLUMN last_streamed_at");
        await queryRunner.query("ALTER TABLE streams DROP COLUMN description");
    }
}
