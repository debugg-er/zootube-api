import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserDescriptionColumn1635237065284 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users
            ADD COLUMN description VARCHAR(10000)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP COLUMN description`);
    }
}
