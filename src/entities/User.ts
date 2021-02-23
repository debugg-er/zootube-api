import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CommentLike } from "./CommentLike";
import { Comment } from "./Comment";
import { Subscription } from "./Subscription";
import { VideoLike } from "./VideoLike";
import { Video } from "./Video";
import { WatchedVideo } from "./WatchedVideo";

@Index("users_pkey", ["id"], { unique: true })
@Index("users_username_key", ["username"], { unique: true })
@Entity("users", { schema: "public" })
export class User {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "username", unique: true, length: 32 })
    username: string;

    @Column("character", { name: "password", length: 100 })
    password: string;

    @Column("character varying", { name: "first_name", length: 32 })
    firstName: string;

    @Column("character varying", { name: "last_name", length: 32 })
    lastName: string;

    @Column("boolean", { name: "female" })
    female: boolean;

    @Column("character varying", { name: "photo_path", length: 128 })
    photoPath: string;

    @OneToMany(() => CommentLike, (commentLikes) => commentLikes.user)
    commentLikes: CommentLike[];

    @OneToMany(() => Comment, (comments) => comments.user)
    comments: Comment[];

    @OneToMany(() => Subscription, (subscriptions) => subscriptions.subscriber)
    subscribers: Subscription[];

    @OneToMany(() => Subscription, (subscriptions) => subscriptions.user)
    subscriptions: Subscription[];

    @OneToMany(() => VideoLike, (videoLikes) => videoLikes.user)
    videoLikes: VideoLike[];

    @OneToMany(() => Video, (videos) => videos.uploadedBy)
    videos: Video[];

    @OneToMany(() => WatchedVideo, (watchedVideos) => watchedVideos.user)
    watchedVideos: WatchedVideo[];
}
