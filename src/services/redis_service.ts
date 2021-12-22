import * as Redis from "ioredis";

import env from "../providers/env";
import { User } from "../entities/User";

export class RedisServiceError extends Error {
    constructor(message: string, command: object) {
        super(message + "\nCOMMAND: " + JSON.stringify(command));
    }
}

class RedisService {
    private client = new Redis({
        port: env.REDIS_PORT,
        host: env.REDIS_HOST,
        password: env.REDIS_PASSWORD,
        family: 4,
    });

    public async addTokensToBlacklist(tokens: string | Array<string>): Promise<void> {
        if (!Array.isArray(tokens)) tokens = [tokens];
        try {
            for (const token of tokens) {
                const decoded = await User.verifyJWT(token);
                const expireTime = decoded.exp - Math.floor(Date.now() / 1000);
                await this.client.set(token, JSON.stringify(decoded), "EX", expireTime);
            }
        } catch (e) {
            throw new RedisServiceError(e.message, e.command);
        }
    }

    public async removeTokensFromBlackList(tokens: string | Array<string>): Promise<void> {
        if (!Array.isArray(tokens)) tokens = [tokens];
        try {
            for (const token of tokens) {
                await this.client.del(token);
            }
        } catch (e) {
            throw new RedisServiceError(e.message, e.command);
        }
    }

    public async isTokenInBlacklist(token: string): Promise<boolean> {
        try {
            return !!(await this.client.get(token));
        } catch (e) {
            throw new RedisServiceError(e.message, e.command);
        }
    }

    public async addClientToWaitList(ip: string, agent: string, videoId: string): Promise<void> {
        try {
            await this.client.set(ip + agent + videoId, 1, "EX", 30);
        } catch (e) {
            throw new RedisServiceError(e.message, e.command);
        }
    }

    public async isClientInWaitList(ip: string, agent: string, videoId: string): Promise<boolean> {
        try {
            return !!(await this.client.get(ip + agent + videoId));
        } catch (e) {
            throw new RedisServiceError(e.message, e.command);
        }
    }
}

export default new RedisService();
