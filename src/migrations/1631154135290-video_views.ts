import { MigrationInterface, QueryRunner } from "typeorm";

export class videoViews1631154135290 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE video_views (
            video_id CHAR(10),
            "date" DATE,
            views INT NOT NULL DEFAULT 0,
            PRIMARY KEY (video_id, date),
            FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
        )`);

        await queryRunner.query(`
            CREATE PROCEDURE spud_increase_video_view(_video_id CHAR(10))
            AS $BODY$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM video_views
                    WHERE
                        video_id = _video_id
                    AND
                        "date" = CURRENT_DATE
                ) THEN
                    UPDATE video_views
                    SET views = views + 1
                    WHERE video_id = _video_id AND "date" = CURRENT_DATE;
                ELSE
                    INSERT INTO video_views VALUES (_video_id, CURRENT_DATE, 1);
                END IF;

                UPDATE videos
                SET views = views + 1
                WHERE id = _video_id;
            END
            $BODY$ LANGUAGE 'plpgsql';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP PROCEDURE spud_increase_video_view`);
        await queryRunner.query(`DROP TABLE video_views`);
    }
}
