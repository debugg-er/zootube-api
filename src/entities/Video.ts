import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    getRepository,
    Index,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { Comment } from "./Comment";
import { Category } from "./Category";
import { VideoLike } from "./VideoLike";
import { User } from "./User";
import { WatchedVideo } from "./WatchedVideo";
import { randomString } from "../utils/string_function";
import { ModelError } from "../commons/errors";
import { urlPathRegex } from "../commons/regexs";

export const THUMBNAIL_HEIGHT = 160;

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

    @Column("timestamp with time zone", { name: "uploaded_at", default: () => "CURRENT_TIMESTAMP" })
    uploadedAt: Date;

    @OneToMany(() => Comment, (comments) => comments.video)
    comments: Comment[];

    @ManyToMany(() => Category, (categories) => categories.videos)
    categories: Category[];

    @OneToMany(() => VideoLike, (videoLikes) => videoLikes.video)
    videoLikes: VideoLike[];

    @ManyToOne(() => User, (users) => users.videos, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "uploaded_by", referencedColumnName: "id" }])
    uploadedBy: User;

    @OneToMany(() => WatchedVideo, (watchedVideos) => watchedVideos.video)
    watchedVideos: WatchedVideo[];

    // --- additional methods
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
    validate() {
        if (this.videoPath && !urlPathRegex.test(this.videoPath)) {
            throw new ModelError("invalid video_path");
        }
        if (this.thumbnailPath && !urlPathRegex.test(this.thumbnailPath)) {
            throw new ModelError("invalid thumbnail_path");
        }
    }
}
