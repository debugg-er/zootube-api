import { MigrationInterface, QueryRunner } from "typeorm";

const data = [
    "Trò chơi",
    "Hài hước",
    "Phim ảnh",
    "Du lịch",
    "Thức ăn",
    "Thể thao",
    "Công nghệ",
    "Âm nhạc",
    "Hoạt hình",
    "Tự nhiên",
];

export class categories1623917020011 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const values = data.map((d) => `('${d}')`).join(",");
        await queryRunner.query(`INSERT INTO categories(category) VALUES ${values}`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const values = data.map((d) => `'${d}'`).join(",");
        await queryRunner.query(`DELETE FROM categories WHERE category IN (${values})`);
    }
}
