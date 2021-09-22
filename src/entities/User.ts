import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { CommentLike } from "./CommentLike";
import { Comment } from "./Comment";
import { Subscription } from "./Subscription";
import { VideoLike } from "./VideoLike";
import { Video } from "./Video";
import { WatchedVideo } from "./WatchedVideo";

import env from "../providers/env";
import { nameRegex, passwordRegex, urlPathRegex, usernameRegex } from "../commons/regexs";
import { ModelError } from "../commons/errors";
import { toTitleCase } from "../utils/string_function";
import { IUserToken } from "../interfaces/user";
import { Role } from "./Role";
import {Playlist} from "./Playlist";

@Index("users_pkey", ["id"], { unique: true })
@Index("users_username_key", ["username"], { unique: true })
@Entity("users", { schema: "public" })
export class User {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "username", unique: true, length: 32 })
    username: string;

    @Column("character varying", { name: "password", length: 72, select: false })
    password: string;

    @Column("character varying", { name: "first_name", length: 32 })
    firstName: string;

    @Column("character varying", { name: "last_name", length: 32 })
    lastName: string;

    @Column("boolean", { name: "female" })
    female: boolean;

    @Column("character varying", { name: "banner_path", length: 128 })
    bannerPath: string | null;

    @Column("character varying", { name: "avatar_path", length: 128 })
    avatarPath: string | null;

    @Column("character varying", { name: "icon_path", length: 128 })
    iconPath: string | null;

    @Column("boolean", { name: "is_blocked", default: false, select: false })
    isBlocked: boolean;

    @Column("timestamp with time zone", { name: "joined_at", default: () => "CURRENT_TIMESTAMP" })
    joinedAt: Date;

    @ManyToOne(() => Role, (roles) => roles.users)
    @JoinColumn([{ name: "role_id", referencedColumnName: "id" }])
    role: Role;

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

    @OneToMany(() => Playlist, (playlists) => playlists.createdBy)
    playlists: Playlist[];

    // --- additional methods
    async comparePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    async signJWT(): Promise<string> {
        return new Promise((resolve, reject) => {
            const payload: IUserToken = {
                id: this.id,
                username: this.username,
                role: this.role.name,
            };

            const option: jwt.SignOptions = {
                expiresIn: env.JWT_EXPIRE_TIME,
            };

            jwt.sign(payload, env.JWT_SECRET, option, (err, token) => {
                if (err) return reject(err);

                resolve(token);
            });
        });
    }

    static async verifyJWT(token: string): Promise<IUserToken> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, env.JWT_SECRET, {}, (err, decoded) => {
                if (err) return reject(err);

                resolve(decoded as IUserToken);
            });
        });
    }

    // --- listeners
    tempPassword: string;

    @AfterLoad()
    rememberPassword() {
        if (this.password) {
            this.tempPassword = this.password;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    renamingName() {
        if (this.firstName) {
            this.firstName = toTitleCase(this.firstName.trim());
        }
        if (this.lastName) {
            this.lastName = toTitleCase(this.lastName.trim());
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    validate() {
        if (this.username && !usernameRegex.test(this.username)) {
            throw new ModelError("invalid username");
        }
        if (this.firstName && !nameRegex.test(this.firstName)) {
            throw new ModelError("invalid first_name");
        }
        if (this.lastName && !nameRegex.test(this.lastName)) {
            throw new ModelError("invalid last_name");
        }
        if (this.avatarPath && !urlPathRegex.test(this.avatarPath)) {
            throw new ModelError("invalid avatar_path");
        }
        if (this.iconPath && !urlPathRegex.test(this.iconPath)) {
            throw new ModelError("invalid icon_path");
        }
        if (this.password && this.tempPassword !== this.password) {
            if (!passwordRegex.test(this.password)) {
                throw new ModelError("invalid password");
            }
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    async encryptPassword() {
        if (!this.password) return;
        if (this.tempPassword === this.password) return;

        this.password = await bcrypt.hash(this.password, env.SALT_ROUND);
    }
}
