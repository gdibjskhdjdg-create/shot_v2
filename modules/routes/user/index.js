const ErrorBoundary = require("../../../helper/errorBoundary.tool");

const authRouter = require("./auth");
const roleRouter = require("./role.routes")
const UserController = require("../../controllers/user/User.controller");
const LoginRequiredMiddleware = require("../../middleware/user/LoginRequired.middleware");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/user ------------------------------ */


async function userRoutes(fastify, opts) {

    fastify.register(roleRouter, { prefix: '/role' });
    fastify.register(authRouter, { prefix: '/auth' });


    // // These routes will have the preHandler applied to all of them
    // const userRoutesWithAuth = async (fastify, opts) => {
    fastify.get('/', {
        preHandler: AuthorizationMiddleware(['users-list', 'user-manage'])
    }, ErrorBoundary(UserController.getUserList));

    fastify.post("/register", {
        preHandler: AuthorizationMiddleware(['user-manage'])
    }, ErrorBoundary(UserController.userRegister));

    fastify.patch("/updateInfo/:userId", {
        preHandler: AuthorizationMiddleware(['user-manage'])
    }, ErrorBoundary(UserController.updateInfo));

    fastify.patch("/changeUserPassword/:userId", {
        preHandler: AuthorizationMiddleware(['user-manage'])
    }, ErrorBoundary(UserController.changeUserPassword));

    fastify.patch("/changeIsActive", {
        preHandler: AuthorizationMiddleware(['user-manage'])
    }, ErrorBoundary(UserController.changeUserIsActive));

    fastify.patch("/changePassword", {
        preHandler: LoginRequiredMiddleware()
    }, ErrorBoundary(UserController.changePassword));

    //     // other routes similarly with preHandlers if needed
    // }
    // // Register the authenticated routes with a prefix
    // fastify.register(userRoutesWithAuth, { prefix: '/' });
}

module.exports = userRoutes;