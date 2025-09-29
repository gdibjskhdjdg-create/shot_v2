const AsyncHandler = require("../../../helper/asyncHandler.tool");
const RoleController = require("../../controllers/user/Role.controller");
const CheckUserHaveValidAccessMiddleware = require("../../middleware/user/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/user/role ------------------------------ */

async function roleRoutes(fastify, opts) {
    fastify.get("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(['roles-list', "role-manage", "user-manage"])
    }, AsyncHandler(RoleController.getRolesList));
    fastify.get("/access", AsyncHandler(RoleController.accessList));
    fastify.post("/", {
        preHandler: CheckUserHaveValidAccessMiddleware(["role-manage"])
    }, AsyncHandler(RoleController.createRole));
    fastify.post("/:userId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["user-manage"])
    }, AsyncHandler(RoleController.assignRolesToUser));
    fastify.patch("/:roleId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["role-manage"])
    }, AsyncHandler(RoleController.updateRole));
    fastify.delete("/:roleId", {
        preHandler: CheckUserHaveValidAccessMiddleware(["role-manage"])
    }, AsyncHandler(RoleController.deleteRole));
}
module.exports = roleRoutes;