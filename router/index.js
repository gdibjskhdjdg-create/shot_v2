// const ResponseDTO.success = require("../app/controllers/Base.controller");
const UserLoaderMiddleware = require("../modules/middleware/user/UserLoader.middleware");

const apiRoutes = require("./api.routes");


async function rootRoutes(fastify, opts) {

  // Register SetUserInfoMiddleware as a preHandler hook for all routes here
  fastify.addHook('preHandler', UserLoaderMiddleware);

  // Register apiRoutes plugin with prefix /api
  fastify.register(apiRoutes, { prefix: '/api' });
}

module.exports = rootRoutes;