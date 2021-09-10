import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Playlist } from "./Playlist";
import { Video } from "./Video";

@Index("playlist_videos_pkey", ["playlistId", "videoId"], { unique: true })
@Entity("playlist_videos", { schema: "public" })
export class PlaylistVideo {
    @Column("integer", { primary: true, name: "playlist_id" })
    playlistId: number;

    @Column("character", { primary: true, name: "video_id", length: 10 })
    videoId: string;

    @Column("timestamp", { name: "added_at" })
    addedAt: Date;

    @ManyToOne(() => Playlist, (playlists) => playlists.playlistVideos, {
        onDelete: "CASCADE",
    })
    @JoinColumn([{ name: "playlist_id", referencedColumnName: "id" }])
    playlist: Playlist;

    @ManyToOne(() => Video, { onDelete: "CASCADE" })
    @JoinColumn([{ name: "video_id", referencedColumnName: "id" }])
    video: Video;
}
