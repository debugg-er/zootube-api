import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Video } from "./Video";

export const PUBLIC_ID = 1;
export const PRIVATE_ID = 2;
export const PUBLIC = "public";
export const PRIVATE = "private";

@Index("privacies_pkey", ["id"], { unique: true })
@Entity("privacies", { schema: "public" })
export class Privacy {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "name" })
    name: string;

    @OneToMany(() => Video, (videos) => videos.privacy)
    videos: Video[];
}
