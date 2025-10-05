const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const RoleController = require("../../controllers/user/Role.controller");
const AuthorizationMiddleware = require("../../middleware/user/Authorization.middleware");

/* ------------------------------ prefix: /api/user/role ------------------------------ */

async function roleRoutes(fastify, opts) {
    fastify.get("/", {
        preHandler: AuthorizationMiddleware(['roles-list', "role-manage", "user-manage"])
    }, ErrorBoundary(RoleController.getRolesList));
    fastify.get("/access", ErrorBoundary(RoleController.accessList));
    fastify.post("/", {
        preHandler: AuthorizationMiddleware(["role-manage"])
    }, ErrorBoundary(RoleController.createRole));
    fastify.post("/:userId", {
        preHandler: AuthorizationMiddleware(["user-manage"])
    }, ErrorBoundary(RoleController.assignRolesToUser));
    fastify.patch("/:roleId", {
        preHandler: AuthorizationMiddleware(["role-manage"])
    }, ErrorBoundary(RoleController.updateRole));
    fastify.delete("/:roleId", {
        preHandler: AuthorizationMiddleware(["role-manage"])
    }, ErrorBoundary(RoleController.deleteRole));
}
module.exports = roleRoutes;