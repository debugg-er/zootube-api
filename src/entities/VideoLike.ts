import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Index("video_likes_pkey", ["userId", "videoId"], { unique: true })
@Entity("video_likes", { schema: "public" })
export class VideoLike {
    @Column("integer", { primary: true, name: "user_id" })
    userId: number;

    @Column("character", { primary: true, name: "video_id", length: 10 })
    videoId: string;

    @Column("boolean", { name: "like" })
    like: boolean;

    @ManyToOne(() => User, (users) => users.videoLikes, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @ManyToOne(() => Video, (videos) => videos.videoLikes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;
}
