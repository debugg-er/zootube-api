import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Comment } from "./Comment";
import { User } from "./User";

@Index("comment_likes_pkey", ["commentId", "userId"], { unique: true })
@Entity("comment_likes", { schema: "public" })
export class CommentLike {
    @Column("integer", { primary: true, name: "user_id" })
    userId: number;

    @Column("integer", { primary: true, name: "comment_id" })
    commentId: number;

    @Column("boolean", { name: "like" })
    like: boolean;

    @ManyToOne(() => Comment, (comments) => comments.commentLikes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "comment_id", referencedColumnName: "id" }])
    comment: Comment;

    @ManyToOne(() => User, (users) => users.commentLikes, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;
}
