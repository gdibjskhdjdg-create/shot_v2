const Redis = require("../../../db/redis")


class ModelInRedisHook {
    constructor({ model }) {
        this.model = model;
        this.expireTime = 10 * 60;
        this.redisKey = `${model.name}_data`;
    }

    async GetData() {
        let data = await Redis.get(this.redisKey);
        if (!data) {
            return null
        }
        return JSON.parse(data);
    }

    async StoreInRedis(data) {
        await Redis.set(this.redisKey, JSON.stringify(data));
        await Redis.expire(this.redisKey, this.expireTime);
    }

    async RemoveRedis() {
        await Redis.del(this.redisKey);
    }

    static hooks(model) {
        if (!model) {
            return {}
        }
        const InRedis = new ModelInRedisHook({ model });

        return {
            afterCreate: (instance, options) => { InRedis.RemoveRedis() },
            afterDestroy: (instance, options) => { InRedis.RemoveRedis() },
            afterSave: (instance, options) => { InRedis.RemoveRedis() },
            afterUpdate: (instance, options) => { InRedis.RemoveRedis() },
            afterUpsert: (created, options) => { InRedis.RemoveRedis() },
            afterBulkCreate: (instances, options) => { InRedis.RemoveRedis() },
            afterBulkDestroy: (options) => { InRedis.RemoveRedis() },
            afterBulkUpdate: (options) => { InRedis.RemoveRedis() },
        }
    }
}

module.exports = ModelInRedisHook;