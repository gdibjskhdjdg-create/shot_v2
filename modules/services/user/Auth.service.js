
const Redis = require("../../../db/redis");
const ErrorResult = require("../../../helper/error.tool");
const { generateAccessToken } = require("../../../helper/jwt.tool");
const Service = require("../../_default/service");
const { User, Role } = require("../../_default/model");
const { comparePassword } = require("./Password.service");


class AuthService extends Service {

    userAuthTime = 60 * 60 * 24 * 10;

    async login(phone, password) {
        const user = await User.findOne({
            where: { phone },
            include: [{
                model: Role,
                attributes: ['id'],
                as: 'role'
            }],
        });

        if (!user || !comparePassword(password, user.password)) {
            throw ErrorResult.badRequest("invalid phone or password")
        }


        const userData = user.toJSON()
        userData.role = user.role.map(x => x.id)

        const token = await this.generateTokenInRedis(userData);

        return { user: userData, token };
    }

    async logout(token, userId) {
        const key = this.generateRedisKey(token);
        await Redis.del(key);

        await this.removeTokenFromUser(token, userId)

        return true;
    }

    generateRedisKey(token) {
        return `user_shotList_${token}`;
    }

    redisKeyUserIdToken(userId) {
        return `user_tokens_shotList_${userId}`
    }

    async generateTokenInRedis(user) {

        const token = generateAccessToken({ id: user.id }, `${this.userAuthTime}s`);

        const key = this.generateRedisKey(token);

        await Redis.set(key, JSON.stringify(user));
        await Redis.expire(key, this.userAuthTime);

        this.cacheUserIdToken(user.id, token)

        return token;
    }

    async cacheUserIdToken(userId, token) {

        const key = this.redisKeyUserIdToken(userId)
        let cached = await Redis.get(key)
        if (!cached) {
            cached = []
        } else {
            cached = JSON.parse(cached)
        }

        cached.push(token)

        await Redis.set(key, JSON.stringify(cached))
    }


    async updateUserTokensInRedis(userId, userItems) {

        let cached = await Redis.get(this.redisKeyUserIdToken(userId))
        if (!cached) return

        const tokens = JSON.parse(cached)

        for (const token of tokens) {
            let cachedUser = await this.getUserInfoFromToken(token)

            if (cachedUser) {

                cachedUser = {
                    ...cachedUser,
                    ...userItems,
                }

                const key = this.generateRedisKey(token);
                await Redis.set(key, JSON.stringify(cachedUser))
            }
        }
    }


    async getUserInfoFromToken(token) {
        const key = this.generateRedisKey(token);
        const dataInRedis = await Redis.get(key);
        if (dataInRedis) {
            return JSON.parse(dataInRedis)
        }
        else {
            return null;
        }
    }

    async removeTokenFromUser(userId, token) {
        const key = this.redisKeyUserIdToken(userId)
        let cachedTokensOfUser = await Redis.get(this.redisKeyUserIdToken(userId))
        if (!cachedTokensOfUser) {
            cachedTokensOfUser = []
        } else {
            cachedTokensOfUser = JSON.parse(cachedTokensOfUser).filter(x => x.token != token)
        }

        await Redis.set(key, JSON.stringify(cachedTokensOfUser))

    }

}

module.exports = new AuthService()