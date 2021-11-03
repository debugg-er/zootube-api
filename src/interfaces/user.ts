export interface IUserToken {
    id: number;
    username: string;
    role: string;
    iat: number;
    exp: number;
    jti?: string;
}
