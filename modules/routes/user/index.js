const AsyncHandler = require("../../../helper/asyncHandler.tool");

const authRouter = require("./auth");
const roleRouter = require("./role.routes")
const UserController = require("../../controllers/user/User.controller");
const OnlyLoginUserMiddleware = require("../../middleware/user/OnlyLoginUser.middleware");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/user ------------------------------ */


async function userRoutes(fastify, opts) {

    fastify.register(roleRouter, { prefix: '/role' });
    fastify.register(authRouter, { prefix: '/auth' });


    // // These routes will have the preHandler applied to all of them
    // const userRoutesWithAuth = async (fastify, opts) => {
    fastify.get('/', {
        preHandler: CheckUserHaveValidAccessMiddleware(['users-list', 'user-manage'])
    }, AsyncHandler(UserController.getUserList));

    fastify.post("/register", {
        preHandler: CheckUserHaveValidAccessMiddleware(['user-manage'])
    }, AsyncHandler(UserController.userRegister));

    fastify.patch("/updateInfo/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['user-manage'])
    }, AsyncHandler(UserController.updateInfo));

    fastify.patch("/changeUserPassword/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(['user-manage'])
    }, AsyncHandler(UserController.changeUserPassword));

    fastify.patch("/changeIsActive", {
        preHandler: CheckUserHaveValidAccessMiddleware(['user-manage'])
    }, AsyncHandler(UserController.changeUserIsActive));

    fastify.patch("/changePassword", {
        preHandler: OnlyLoginUserMiddleware([])
    }, AsyncHandler(UserController.changePassword));

    //     // other routes similarly with preHandlers if needed
    // }
    // // Register the authenticated routes with a prefix
    // fastify.register(userRoutesWithAuth, { prefix: '/' });
}

module.exports = userRoutes;