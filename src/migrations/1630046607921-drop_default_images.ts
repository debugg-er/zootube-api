import { MigrationInterface, QueryRunner } from "typeorm";

const DEFAULT_BANNER_PATH = "/photos/default-banner.png";
const DEFAULT_AVATAR_PATH = "/photos/default-avatar.png";
const DEFAULT_ICON_PATH = "/photos/default-icon.png";

export class dropDefaultImages1630046607921 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE users ALTER COLUMN avatar_path DROP NOT NULL");
        await queryRunner.query("ALTER TABLE users ALTER COLUMN avatar_path DROP DEFAULT");
        await queryRunner.query(
            `UPDATE users SET avatar_path = NULL WHERE avatar_path = '${DEFAULT_AVATAR_PATH}'`,
        );

        await queryRunner.query("ALTER TABLE users ALTER COLUMN banner_path DROP NOT NULL");
        await queryRunner.query("ALTER TABLE users ALTER COLUMN banner_path DROP DEFAULT");
        await queryRunner.query(
            `UPDATE users SET banner_path = NULL WHERE banner_path = '${DEFAULT_BANNER_PATH}'`,
        );

        await queryRunner.query("ALTER TABLE users ALTER COLUMN icon_path DROP NOT NULL");
        await queryRunner.query("ALTER TABLE users ALTER COLUMN icon_path DROP DEFAULT");
        await queryRunner.query(
            `UPDATE users SET icon_path = NULL WHERE icon_path = '${DEFAULT_ICON_PATH}'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `UPDATE users SET avatar_path = '${DEFAULT_AVATAR_PATH}' WHERE avatar_path IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE users ALTER COLUMN avatar_path SET DEFAULT '${DEFAULT_AVATAR_PATH}'`,
        );
        await queryRunner.query("ALTER TABLE users ALTER COLUMN avatar_path SET NOT NULL");

        await queryRunner.query(
            `UPDATE users SET banner_path = '${DEFAULT_BANNER_PATH}' WHERE banner_path IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE users ALTER COLUMN banner_path SET DEFAULT '${DEFAULT_BANNER_PATH}'`,
        );
        await queryRunner.query("ALTER TABLE users ALTER COLUMN banner_path SET NOT NULL");

        await queryRunner.query(
            `UPDATE users SET icon_path = '${DEFAULT_ICON_PATH}' WHERE icon_path IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE users ALTER COLUMN icon_path SET DEFAULT '${DEFAULT_ICON_PATH}'`,
        );
        await queryRunner.query("ALTER TABLE users ALTER COLUMN icon_path SET NOT NULL");
    }
}
