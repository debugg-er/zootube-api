import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UAParser } from "ua-parser-js";

import { User } from "./User";

export interface LoginDevice {
    browser: LoginLog["browser"];
    os: LoginLog["os"];
    device: LoginLog["device"];
    cpu: LoginLog["device"];
}

@Index("login_logs_pkey", ["id"], { unique: true })
@Entity("login_logs", { schema: "public" })
export class LoginLog {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("character varying", { name: "token", length: 256 })
    token: string;

    @Column("character varying", { name: "browser", nullable: true, length: 32 })
    browser: string | null;

    @Column("character varying", { name: "os", nullable: true, length: 32 })
    os: string | null;

    @Column("character varying", { name: "device", nullable: true, length: 32 })
    device: string | null;

    @Column("character varying", { name: "cpu", nullable: true, length: 32 })
    cpu: string | null;

    @Column("timestamp with time zone", {
        name: "logged_in_at",
        default: () => "CURRENT_TIMESTAMP",
    })
    loggedInAt: Date;

    @Column("timestamp with time zone", { name: "logged_out_at", nullable: true })
    loggedOutAt: Date | null;

    @Column("timestamp with time zone", { name: "expire_at" })
    expireAt: Date;

    @ManyToOne(() => User, (users) => users.loginLogs)
    @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
    user: User;

    static parseUserAgent(userAgent: string): LoginDevice {
        const parsed = UAParser(userAgent);
        return {
            browser: parsed.browser.name || null,
            os: parsed.os.name || null,
            device: parsed.device.model || null,
            cpu: parsed.cpu.architecture || null,
        };
    }
}
