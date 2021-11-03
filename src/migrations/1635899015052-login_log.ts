import { MigrationInterface, QueryRunner } from "typeorm";

export class loginLog1635899015052 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(` CREATE TABLE login_logs (
            id SERIAL PRIMARY KEY,
            token VARCHAR(512) NOT NULL,
            logged_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            logged_out_at TIMESTAMP,
            expire_at TIMESTAMP NOT NULL,
            browser VARCHAR(32),
            os VARCHAR(32),
            device VARCHAR(32),
            cpu VARCHAR(32),
            user_id INT NOT NULL,

            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE login_logs`);
    }
}
