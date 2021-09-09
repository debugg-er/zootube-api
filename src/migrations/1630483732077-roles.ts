import { MigrationInterface, QueryRunner } from "typeorm";

export class roles1630483732077 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(32) NOT NULL
        )`);
        await queryRunner.query(`INSERT INTO roles VALUES (1, 'admin'), (2, 'user')`);

        await queryRunner.query(`ALTER TABLE users ADD COLUMN role_id INT NULL`);
        await queryRunner.query(`UPDATE users SET role_id = 2`);
        await queryRunner.query(`ALTER TABLE users ALTER COLUMN role_id SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE users
            ADD CONSTRAINT fk_users_roles
            FOREIGN KEY (role_id) REFERENCES roles(id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT fk_users_roles`);
        await queryRunner.query(`ALTER TABLE users DROP COLUMN role_id`);
        await queryRunner.query(`DROP TABLE roles`);
    }
}
