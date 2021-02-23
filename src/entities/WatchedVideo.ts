import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Index("watched_videos_pkey", ["userId", "videoId"], { unique: true })
@Entity("watched_videos", { schema: "public" })
export class WatchedVideo {
    @Column("integer", { primary: true, name: "user_id" })
    userId: number;

    @Column("character", { primary: true, name: "video_id", length: 10 })
    videoId: string;

    @Column("date", { name: "watched_at" })
    watchedAt: string;

    @ManyToOne(() => User, (users) => users.watchedVideos, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @ManyToOne(() => Video, (videos) => videos.watchedVideos, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;
}
