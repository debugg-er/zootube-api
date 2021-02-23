import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { Comment } from "./Comment";
import { Categorie } from "./Categorie";
import { VideoLike } from "./VideoLike";
import { User } from "./User";
import { WatchedVideo } from "./WatchedVideo";

@Index("videos_pkey", ["id"], { unique: true })
@Entity("videos", { schema: "public" })
export class Video {
    @Column("character", { primary: true, name: "id", length: 10 })
    id: string;

    @Column("character varying", { name: "title", length: 128 })
    title: string;

    @Column("character varying", { name: "video_path", length: 128 })
    videoPath: string;

    @Column("character varying", { name: "thumbnail_path", length: 128 })
    thumbnailPath: string;

    @Column("integer", { name: "duration" })
    duration: number;

    @Column("character varying", {
        name: "description",
        nullable: true,
        length: 5000,
    })
    description: string | null;

    @Column("integer", { name: "views", default: () => "0" })
    views: number;

    @Column("date", { name: "uploaded_at", default: () => "CURRENT_TIMESTAMP" })
    uploadedAt: string;

    @OneToMany(() => Comment, (comments) => comments.video)
    comments: Comment[];

    @ManyToMany(() => Categorie, (categories) => categories.videos)
    categories: Categorie[];

    @OneToMany(() => VideoLike, (videoLikes) => videoLikes.video)
    videoLikes: VideoLike[];

    @ManyToOne(() => User, (users) => users.videos, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
    uploadedBy: User;

    @OneToMany(() => WatchedVideo, (watchedVideos) => watchedVideos.video)
    watchedVideos: WatchedVideo[];
}
