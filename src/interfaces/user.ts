export interface IUserToken {
    id: number;
    username: string;
    iat?: number;
    exp?: number;
    jti?: string;
}
