import { MigrationInterface, QueryRunner } from "typeorm";

export class addSomeTimestamp1631356669259 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE subscriptions
            ADD COLUMN subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        await queryRunner.query(`ALTER TABLE video_likes
            ADD COLUMN reacted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE video_likes DROP COLUMN reacted_at`);
        await queryRunner.query(`ALTER TABLE subscriptions DROP COLUMN subscribed_at`);
    }
}
