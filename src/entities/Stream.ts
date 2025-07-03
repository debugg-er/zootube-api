import { Matches, MaxLength, validateOrReject } from "class-validator";
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    getRepository,
    Index,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { urlPathRegex } from "../commons/regexs";
import { randomString } from "../utils/string_function";
import { User } from "./User";

export const STREAM_KEY_LENGTH = 32;

@Index("streams_pkey", ["id"], { unique: true })
@Entity("streams", { schema: "public" })
export class Stream {
    @Column("character", { primary: true, name: "id", length: 10 })
    id: string;

    @Column("character", { name: "stream_key", length: STREAM_KEY_LENGTH, select: false })
    streamKey: string;

    @MaxLength(128, { message: "stream name is too long" })
    @Column("character varying", { name: "name", length: 128 })
    name: string;

    @Matches(urlPathRegex, { message: "thumbnailPath is not url path" })
    @Column("character varying", { name: "thumbnail_path", length: 128 })
    thumbnailPath: string | null;

    @MaxLength(5000, { message: "description is too long" })
    @Column("character varying", { name: "description", length: 5000 })
    description: string | null;

    @Column("timestamp with time zone", { name: "last_streamed_at" })
    lastStreamedAt: Date | null;

    @Column("boolean", { name: "is_streaming", default: false })
    isStreaming: boolean;

    @Column("integer", { name: "user_id", select: false })
    userId: number;

    @OneToOne(() => User, (users) => users.stream)
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    static async generateId(): Promise<string> {
        let id;
        do {
            id = randomString(10);
        } while ((await getRepository(this).count({ id })) === 1);

        return id;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async validate(): Promise<void> {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
