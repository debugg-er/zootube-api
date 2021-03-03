import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { CommentLike } from "./CommentLike";
import { User } from "./User";
import { Video } from "./Video";

@Index("comments_pkey", ["id"], { unique: true })
@Entity("comments", { schema: "public" })
export class Comment {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "content", length: 2000 })
    content: string;

    @Column("timestamp", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: string;

    @OneToMany(() => CommentLike, (commentLikes) => commentLikes.comment)
    commentLikes: CommentLike[];

    @ManyToOne(() => Comment, (comments) => comments.comments, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "parent_id", referencedColumnName: "id" }])
    parent: Comment;

    @OneToMany(() => Comment, (comments) => comments.parent)
    comments: Comment[];

    @ManyToOne(() => User, (users) => users.comments, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @ManyToOne(() => Video, (videos) => videos.comments, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;
}
