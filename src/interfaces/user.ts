export interface IUserToken {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    iat?: number;
    exp?: number;
    jti?: string;
}
