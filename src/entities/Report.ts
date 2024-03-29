import { MaxLength, validateOrReject } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Video } from "./Video";

@Index("reports_pkey", ["id"], { unique: true })
@Entity("reports", { schema: "public" })
export class Report {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @MaxLength(2000, { message: "reason is too long" })
    @Column("character varying", { name: "reason", length: 2000 })
    reason: string;

    @Column("boolean", { name: "is_resolved", default: false })
    isResolved: boolean;

    @Column("timestamp with time zone", { name: "created_at", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @ManyToOne(() => User, (users) => users.reports, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    @ManyToOne(() => Video, (videos) => videos.reports, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;

    @BeforeInsert()
    @BeforeUpdate()
    async validate(): Promise<void> {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
