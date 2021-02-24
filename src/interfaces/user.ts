export interface IUserToken {
    username: string;
    firstName: string;
    lastName: string;
    iat?: number;
    exp?: number;
    jti?: string;
}
