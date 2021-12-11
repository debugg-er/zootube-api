import { MigrationInterface, QueryRunner } from "typeorm";

export class addVideoQualities1639205946973 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE videos RENAME video_path TO video720_path`);
        await queryRunner.query(`ALTER TABLE videos ALTER video720_path DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE videos ADD COLUMN video360_path VARCHAR(128)`);
        await queryRunner.query(`ALTER TABLE videos ADD COLUMN video480_path VARCHAR(128)`);
        await queryRunner.query(`ALTER TABLE videos ADD COLUMN video1080_path VARCHAR(128)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE videos DROP COLUMN video1080_path`);
        await queryRunner.query(`ALTER TABLE videos DROP COLUMN video480_path`);
        await queryRunner.query(`ALTER TABLE videos DROP COLUMN video360_path`);
        await queryRunner.query(`UPDATE videos SET video720_path = '/path/to/video'`);
        await queryRunner.query(`ALTER TABLE videos ALTER COLUMN video720_path SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE videos RENAME video72_path TO video_path`);
    }
}
