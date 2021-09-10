import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Video } from "./Video";

@Index("video_views_pkey", ["videoId", "date"], { unique: true })
@Entity("video_views", { schema: "public" })
export class VideoView {
    @Column("character", { primary: true, name: "video_id" })
    videoId: string;

    @Column("date", {
        primary: true,
        name: "date",
        transformer: {
            to: (entityValue: Date) => entityValue,
            from: (databaseValue: string): Date => new Date(databaseValue),
        },
    })
    date: Date;

    @Column("integer", { name: "views", default: 0 })
    views: number;

    @ManyToOne(() => Video, (videos) => videos.videoViews)
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;
}

