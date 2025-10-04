const ResponseDTO = require("../../_default/Response.dto");
const RoleResponse = require("../../dto/user/Role.response");
const AccessEntity = require("../../entity/user/Access.entity");
const RoleService = require("../../services/user/Role.service");
const RoleValidation = require("../../validation/user/Role.validation");

async function accessList(req, res) {
    const access = AccessEntity.getAccessList()
    return ResponseDTO.success(res, access)
}

// async test(req, res) {

//     const {userId} = req.params

//     return ResponseDTO.success(res)
// }

async function getRolesList(req, res) {

    const roles = await RoleService.getRoles()

    return ResponseDTO.success(res, RoleResponse.create(roles))
}

async function createRole(req, res) {

    const validation = await RoleValidation.createRole(req.body)
    await RoleService.createRole(validation)

    return ResponseDTO.success(res)
}

async function updateRole(req, res) {
    const { roleId } = req.params

    const validation = await RoleValidation.updateRole(roleId, req.body)
    await RoleService.updateRole(roleId, validation)

    return ResponseDTO.success(res)
}

async function deleteRole(req, res) {
    const { roleId } = req.params
    await RoleService.deleteRole(roleId)
    return ResponseDTO.success(res)
}

async function assignRolesToUser(req, res) {
    const { userId } = req.params
    const { userId: validateUserId, roles } = await RoleValidation.assignRolesToUser(userId, req.body)
    await RoleService.assignRolesToUser(validateUserId, roles)
    return ResponseDTO.success(res)

}

module.exports = {
    accessList,
    getRolesList,
    createRole,
    updateRole,
    deleteRole,
    assignRolesToUser

};