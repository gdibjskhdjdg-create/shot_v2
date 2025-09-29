/* -------------------------------- Packages -------------------------------- */
// const fastify = require('fastify');
const fastify = require('fastify')({
    bodyLimit: 50 * 1024 * 1024, // 50MB limit equivalent
    logger: true // Enable built-in logging

})
const fastifyCookie = require('@fastify/cookie');
const fastifyCompress = require('@fastify/compress');
const fastifyCors = require('@fastify/cors');
const fastifyHelmet = require('@fastify/helmet');
const fastifyStatic = require('@fastify/static');
const path = require("path");
const routes = require("./router");

/* Cache all data */
require("./init");

/* Register listeners */
require("./init/EventListener.js");
require("./init/CronJob");


const LoggingError = require("./init/LoggingError");

fastify.register(fastifyCookie);
fastify.register(fastifyCompress);
fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['*'], // Allow all HTTP methods
    allowedHeaders: ['*'] // Allow all headers
    // origin: "http://localhost:3000",
    // credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    // allowedHeaders: [
    //     'Content-Type',
    //     'Authorization',
    //     'X-Requested-With',
    //     'Accept',
    //     'Origin',
    //     'X-CSRF-Token'
    // ],
    // exposedHeaders: [
    //     'Content-Range',
    //     'X-Content-Range'
    // ],
    // preflightContinue: false,
    // optionsSuccessStatus: 204
});
fastify.register(fastifyHelmet, {
    crossOriginResourcePolicy: { policy: "cross-origin" }
});
fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'tmp'),
    prefix: '/',
    decorateReply: false
});
fastify.register(require('@fastify/multipart'), {
    attachFieldsToBody: true,
    // limits: {
    //     fieldNameSize: 100, // Max field name size in bytes
    //     fieldSize: 100,     // Max field value size in bytes
    //     fields: 10,         // Max number of non-file fields
    //     fileSize: 1000000,  // For multipart forms, the max file size in bytes
    //     files: 1,           // Max number of file fields
    //     headerPairs: 2000,  // Max number of header key=>value pairs
    //     parts: 1000         // For multipart forms, the max number of parts (fields + files)
    //   }
})


/* ----------------------------- Log Store Setup ---------------------------- */
LoggingError(fastify, appConfigs);

/* --------------------------------- Routes --------------------------------- */
fastify.register(routes, { prefix: '/' });


// After routes are registered, print the routes to the console
// fastify.ready(() => {
//     console.log(fastify.printRoutes());
// });


module.exports = fastify;