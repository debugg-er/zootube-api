import { MigrationInterface, QueryRunner } from "typeorm";

export class createAdminAccountByDefault1632559507101 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO users(username, password, first_name, last_name, female, role_id) VALUES (
                'admin',
                '$2a$08$5eIJ4vwIKmxDeebpV.r22ulNc79chFX8o5rw30cRwhFBQhubgMoAG',
                'Im',
                'Admin',
                TRUE,
                1
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DELETE FROM users WHERE username='admin'");
    }
}
