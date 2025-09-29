const Service = require("../../_default/service");
const crypto = require('crypto');
const redis = require('../../../db/redis');

class TableCount_Service extends Service {
    async keyInRedis(model, query){
        delete query.offset;
        delete query.limit;
        delete query.order;

        const json = model.getTableName() + "_" +JSON.stringify(query)
        return await crypto.createHash('sha256').update(json).digest('hex');
    }

    async storeTableCountInRedis(model, query, count){
        const key = await this.keyInRedis(model, query);
        await redis.set(key, count);
        await redis.expire(key, 3 * 60);
    }

    async getTableCountFromRedis(model, query){
        const key = await this.keyInRedis(model, query);
        let checkRedis = await redis.get(key);
        console.log(key, checkRedis)
        if(!checkRedis) return null;

        return JSON.parse(checkRedis);
    }
}

module.exports = new TableCount_Service();