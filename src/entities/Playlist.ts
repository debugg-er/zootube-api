import { MaxLength, validateOrReject } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import VirtualColumn from "../decorators/VirtualColumn";
import { PlaylistVideo } from "./PlaylistVideo";
import { User } from "./User";

@Index("playlists_pkey", ["id"], { unique: true })
@Entity("playlists", { schema: "public" })
export class Playlist {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @MaxLength(128, { message: "playlist name is too long" })
    @Column("character varying", { name: "name", length: 128 })
    name: string;

    @MaxLength(5000, { message: "description is too long" })
    @Column("character varying", { name: "description", length: 5000 })
    description: string | null;

    @Column("timestamp with time zone", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.playlists, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "created_by", referencedColumnName: "id" }])
    createdBy: User;

    @OneToMany(() => PlaylistVideo, (playlistVideos) => playlistVideos.playlist)
    playlistVideos: PlaylistVideo[];

    @VirtualColumn("integer")
    totalVideos: number | null;

    @BeforeInsert()
    @BeforeUpdate()
    async validate(): Promise<void> {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
