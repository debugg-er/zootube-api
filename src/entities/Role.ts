import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

export const ADMIN_ID = 1;
export const USER_ID = 2;
export const ADMIN = "admin";
export const USER = "user";

@Index("roles_pkey", ["id"], { unique: true })
@Entity("roles", { schema: "public" })
export class Role {
    @PrimaryGeneratedColumn({ type: "integer", name: "id" })
    id: number;

    @Column("integer", { name: "name" })
    name: string;

    @OneToMany(() => User, (users) => users.role)
    users: User[];
}
