import { Column, Entity, Index, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Video } from "./Video";

@Index("categories_pkey", ["id"], { unique: true })
@Entity("categories", { schema: "public" })
export class Category {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "category", length: 32 })
    category: string;

    @ManyToMany(() => Video, (videos) => videos.categories)
    @JoinTable({
        name: "video_categories",
        joinColumns: [{ name: "category_id", referencedColumnName: "id" }],
        inverseJoinColumns: [{ name: "video_id", referencedColumnName: "id" }],
        schema: "public",
    })
    videos: Video[];
}
