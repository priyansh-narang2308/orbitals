import { Redis } from "@upstash/redis";
import prisma from "./db.js";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const getCachedUser = async (accessToken) => {
    const cacheKey = `user:${accessToken}`;

    try {
        //get user from redis
        const cachedUser = await redis.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        // fallback
        const user = await prisma.user.findFirst({
            where: { sessions: { some: { token: accessToken } } },
            select: { id: true, name: true, email: true, image: true }
        });

        if (user) {
            //store in redis for 1hr
            await redis.set(cacheKey, user, { ex: 3600 });
        }

        return user;
    } catch (error) {
        return await prisma.user.findFirst({
            where: { sessions: { some: { token: accessToken } } },
            select: { id: true, name: true, email: true, image: true }
        });
    }
};

export default redis;
