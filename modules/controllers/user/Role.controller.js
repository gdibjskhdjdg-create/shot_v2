const BaseController = require("../../_default/controller/Base.controller");
const RoleDTO = require("../../dto/user/Role.dto");
const AccessEntity = require("../../entity/user/Access.entity");
const RoleService = require("../../services/user/Role.service");
const RoleValidation = require("../../validation/user/Role.validation");


class RoleController {

    async accessList(req, res) {
        const access = AccessEntity.getAccessList()
        return BaseController.ok(res, access)
    }

    // async test(req, res) {

    //     const {userId} = req.params

    //     return BaseController.ok(res)
    // }

    async getRolesList(req, res) {

        const roles = await RoleService.getRoles()

        return BaseController.ok(res, RoleDTO.create(roles))
    }

    async createRole(req, res) {

        const validation = await RoleValidation.createRole(req.body)
        await RoleService.createRole(validation)

        return BaseController.ok(res)
    }

    async updateRole(req, res) {
        const { roleId } = req.params

        const validation = await RoleValidation.updateRole(roleId, req.body)
        await RoleService.updateRole(roleId, validation)

        return BaseController.ok(res)
    }

    async deleteRole(req, res) {
        const { roleId } = req.params
        await RoleService.deleteRole(roleId)
        return BaseController.ok(res)
    }

    async assignRolesToUser(req, res) {
        const { userId } = req.params
        const { userId: validateUserId, roles } = await RoleValidation.assignRolesToUser(userId, req.body)
        await RoleService.assignRolesToUser(validateUserId, roles)
        return BaseController.ok(res)
    }
}

module.exports = new RoleController();