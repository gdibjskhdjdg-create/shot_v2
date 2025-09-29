
module.exports = {
    port: process.env.REDIS_PORT || 6397, // Redis port
    host: process.env.REDIS_HOST || "localhost", // Redis host
    expirationTime: 60 * 60 * 24, // Redis expiration time

    password: process.env.REDIS_PASSWORD,
}