const Redis = require("ioredis");
const { configLog } = require("../helper/showLog");

class RedisClass {

    constructor() {
        this.host = appConfigs.REDIS.host;
        this.port = appConfigs.REDIS.port;
        this.password = appConfigs.REDIS.password;
    }

    startRedis() {
        return this.redis = new Redis({
            host: this.host,
            port: this.port,
            password: this.password,
        });
    }

    static getInstance() {
        if (!this.instance) {
            let redisModelClass = new RedisClass();
            this.instance = redisModelClass.startRedis();
            configLog(`[+] Connected to redis`)
        }

        return this.instance;
    }
}

module.exports = RedisClass.getInstance();