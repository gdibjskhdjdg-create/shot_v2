const AsyncHandler = require("../../../helper/asyncHandler.tool");
const RoleController = require("../controller/Role.controller");
const OnlyAdminMiddleware = require("../middleware/OnlyAdmin.middleware");
const CheckUserHaveValidAccess = require("../middleware/CheckUserHaveValidAccess.middleware");

/* ------------------------------ prefix: /api/user/role ------------------------------ */

async function roleRoutes(fastify, opts) {
    fastify.get("/", {
        preHandler: CheckUserHaveValidAccess(['roles-list', "role-manage", "user-manage"])
    }, AsyncHandler(RoleController.getRolesList));
    fastify.get("/access", AsyncHandler(RoleController.accessList));
    fastify.post("/", {
        preHandler: CheckUserHaveValidAccess(["role-manage"])
    }, AsyncHandler(RoleController.createRole));
    fastify.post("/:userId", {
        preHandler: CheckUserHaveValidAccess(["user-manage"])
    }, AsyncHandler(RoleController.assignRolesToUser));
    fastify.patch("/:roleId", {
        preHandler: CheckUserHaveValidAccess(["role-manage"])
    }, AsyncHandler(RoleController.updateRole));
    fastify.delete("/:roleId", {
        preHandler: CheckUserHaveValidAccess(["role-manage"])
    }, AsyncHandler(RoleController.deleteRole));
}
module.exports = roleRoutes;