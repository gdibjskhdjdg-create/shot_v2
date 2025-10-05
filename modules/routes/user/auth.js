const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const AuthController = require("../../controllers/user/Auth.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");

/* ------------------------------ prefix: /api/user/auth ------------------------------ */

// Define your routes
async function authRoutes(fastify, opts) {

    fastify.post("/login", ErrorBoundary(AuthController.login));


    // Create a protected context
    fastify.register(async (fastifyProtected, opts) => {
        // Add authentication hook for all routes in this group
        fastifyProtected.addHook('preHandler', LoginRequiredMiddleware());

        // These routes will be at /api/user/auth/ (no additional prefix)
        fastifyProtected.get("/", ErrorBoundary(AuthController.checkLogin));
        fastifyProtected.get("/logout", ErrorBoundary(AuthController.logout));
    });
}


module.exports = authRoutes;