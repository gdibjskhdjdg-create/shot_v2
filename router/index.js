// const ResponseDTO.success = require("../app/controllers/Base.controller");
const ErrorResult = require("../helper/error.tool");
const SetUserInfoMiddleware = require("../modules/middleware/user/SetUserInfo.middleware");

const apiRoutes = require("./api.routes");


async function rootRoutes(fastify, opts) {

  // Register SetUserInfoMiddleware as a preHandler hook for all routes here
  fastify.addHook('preHandler', SetUserInfoMiddleware);

  // Register apiRoutes plugin with prefix /api
  fastify.register(apiRoutes, { prefix: '/api' });
}

module.exports = rootRoutes;