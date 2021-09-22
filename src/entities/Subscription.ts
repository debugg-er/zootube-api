import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Index("subscriptions_pkey", ["subscriberId", "userId"], { unique: true })
@Entity("subscriptions", { schema: "public" })
export class Subscription {
    @Column("integer", { primary: true, name: "user_id" })
    userId: number;

    @Column("integer", { primary: true, name: "subscriber_id" })
    subscriberId: number;

    @Column("timestamp with time zone", {
        name: "subscribed_at",
        default: () => "CURRENT_TIMESTAMP",
    })
    subscribedAt: Date;

    @ManyToOne(() => User, (users) => users.subscribers, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "subscriber_id", referencedColumnName: "id" }])
    subscriber: User;

    @ManyToOne(() => User, (users) => users.subscriptions, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;
}
