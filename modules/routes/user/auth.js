const AsyncHandler = require("../../../helper/asyncHandler.tool");
const AuthController = require("../../controllers/user/Auth.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");

/* ------------------------------ prefix: /api/user/auth ------------------------------ */

// Define your routes
async function authRoutes(fastify, opts) {

    fastify.post("/login", AsyncHandler(AuthController.login));


    // Create a protected context
    fastify.register(async (fastifyProtected, opts) => {
        // Add authentication hook for all routes in this group
        fastifyProtected.addHook('preHandler', OnlyLoginUserMiddleware());

        // These routes will be at /api/user/auth/ (no additional prefix)
        fastifyProtected.get("/", AsyncHandler(AuthController.checkLogin));
        fastifyProtected.get("/logout", AsyncHandler(AuthController.logout));
    });
}


module.exports = authRoutes;