const Redis = require("../../../db/redis");
const ErrorResult = require("../../../helper/error.tool");
const { generateAccessToken } = require("../../../helper/jwt.tool");
const { User, Role } = require("../../_default/model");
const { comparePassword } = require("./Password.service");

const userAuthTime = 60 * 60 * 24 * 10;

const generateRedisKey = (token) => `user_shotList_${token}`;
const redisKeyUserIdToken = (userId) => `user_tokens_shotList_${userId}`;

const cacheUserIdToken = async (userId, token) => {
    const key = redisKeyUserIdToken(userId);
    let cached = await Redis.get(key);
    if (!cached) {
        cached = [];
    } else {
        cached = JSON.parse(cached);
    }

    cached.push(token);

    await Redis.set(key, JSON.stringify(cached));
};

const generateTokenInRedis = async (user) => {
    const token = generateAccessToken({ id: user.id }, `${userAuthTime}s`);
    const key = generateRedisKey(token);

    await Redis.set(key, JSON.stringify(user));
    await Redis.expire(key, userAuthTime);

    await cacheUserIdToken(user.id, token);

    return token;
};

const login = async (phone, password) => {
    const user = await User.findOne({
        where: { phone },
        include: [{
            model: Role,
            attributes: ['id'],
            as: 'role'
        }],
    });

    if (!user || !comparePassword(password, user.password)) {
        throw ErrorResult.badRequest("invalid phone or password");
    }

    const userData = user.toJSON();
    userData.role = user.role.map(x => x.id);

    const token = await generateTokenInRedis(userData);

    return { user: userData, token };
};

const removeTokenFromUser = async (userId, token) => {
    const key = redisKeyUserIdToken(userId);
    let cachedTokensOfUser = await Redis.get(key);
    if (!cachedTokensOfUser) {
        cachedTokensOfUser = [];
    } else {
        cachedTokensOfUser = JSON.parse(cachedTokensOfUser).filter(x => x.token !== token);
    }

    await Redis.set(key, JSON.stringify(cachedTokensOfUser));
};

const logout = async (token, userId) => {
    const key = generateRedisKey(token);
    await Redis.del(key);
    await removeTokenFromUser(userId, token);
    return true;
};

const getUserInfoFromToken = async (token) => {
    const key = generateRedisKey(token);
    const dataInRedis = await Redis.get(key);
    if (dataInRedis) {
        return JSON.parse(dataInRedis);
    }
    return null;
};

const updateUserTokensInRedis = async (userId, userItems) => {
    let cached = await Redis.get(redisKeyUserIdToken(userId));
    if (!cached) return;

    const tokens = JSON.parse(cached);

    for (const token of tokens) {
        let cachedUser = await getUserInfoFromToken(token);

        if (cachedUser) {
            cachedUser = {
                ...cachedUser,
                ...userItems,
            };

            const key = generateRedisKey(token);
            await Redis.set(key, JSON.stringify(cachedUser));
        }
    }
};

module.exports = {
    login,
    logout,
    getUserInfoFromToken,
    updateUserTokensInRedis,
};