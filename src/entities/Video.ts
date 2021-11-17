import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    getManager,
    getRepository,
    Index,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Matches, MaxLength, validateOrReject } from "class-validator";
import { Comment } from "./Comment";
import { Category } from "./Category";
import { VideoLike } from "./VideoLike";
import { User } from "./User";
import { randomString } from "../utils/string_function";
import { urlPathRegex } from "../commons/regexs";
import VirtualColumn from "../decorators/VirtualColumn";
import { VideoView } from "./VideoView";
import { Privacy } from "./Privacy";
import { Report } from "./Report";

@Index("videos_pkey", ["id"], { unique: true })
@Entity("videos", { schema: "public" })
export class Video {
    @Column("character", { primary: true, name: "id", length: 10 })
    id: string;

    @MaxLength(128, { message: "title is too long" })
    @Column("character varying", { name: "title", length: 128 })
    title: string;

    @Matches(urlPathRegex, { message: "videoPath is not url path" })
    @Column("character varying", { name: "video_path", length: 128, select: false })
    videoPath: string;

    @Matches(urlPathRegex, { message: "thumbnailPath is not url path" })
    @Column("character varying", { name: "thumbnail_path", length: 128 })
    thumbnailPath: string;

    @Column("integer", { name: "duration" })
    duration: number;

    @MaxLength(5000, { message: "description is too long" })
    @Column("character varying", {
        name: "description",
        nullable: true,
        length: 5000,
    })
    description: string | null;

    @Column("bigint", { name: "views", default: () => 0 })
    views: number;

    @Column("boolean", { name: "is_blocked", default: false, select: false })
    isBlocked: boolean;

    @Column("timestamp with time zone", { name: "uploaded_at", default: () => "CURRENT_TIMESTAMP" })
    uploadedAt: Date;

    @OneToMany(() => Comment, (comments) => comments.video)
    comments: Comment[];

    @OneToMany(() => Report, (reports) => reports.video)
    reports: Report[];

    @ManyToMany(() => Category, (categories) => categories.videos)
    categories: Category[];

    @OneToMany(() => VideoLike, (videoLikes) => videoLikes.video)
    videoLikes: VideoLike[];

    @ManyToOne(() => User, (users) => users.videos, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
    uploadedBy: User;

    @OneToMany(() => VideoView, (videoViews) => videoViews.video)
    videoViews: VideoView[];

    @ManyToOne(() => Privacy, (privacies) => privacies.videos)
    @JoinColumn([{ name: "privacy_id", referencedColumnName: "id" }])
    privacy: Privacy;

    // --- virtual columns
    @VirtualColumn("integer")
    like: number | null;

    @VirtualColumn("integer")
    dislike: number | null;

    @VirtualColumn("integer")
    totalComments: number | null;

    @VirtualColumn("boolean")
    react: boolean | null;

    // --- additional methods
    async increaseView(): Promise<void> {
        return getManager().query("CALL spud_increase_video_view($1)", [this.id]);
    }

    static async generateId(): Promise<string> {
        let id;
        do {
            id = randomString(10);
        } while ((await getRepository(this).count({ id })) === 1);

        return id;
    }

    // --- listeners
    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
