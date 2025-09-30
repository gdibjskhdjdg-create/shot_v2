const BaseController = require("../../_default/controller/Base.controller");
const RoleService = require("../../services/user/Role.service");
const { createRoleValidation, updateRoleValidation, assignRolesToUserValidation } = require("../../validation/user/Role.validation");
const AccessEntity = require("../../entity/user/Access.entity");

const accessList = async (req, res) => {
    const access = AccessEntity.getAccessList()
    return BaseController.ok(res, access)
};

const getRoles = async (req, res) => {
    const roles = await RoleService.getRoles(req.query);
    return BaseController.ok(res, roles);
};

const getRole = async (req, res) => {
    const role = await RoleService.getById(req.params.roleId);
    return BaseController.ok(res, role);
};

const createRole = async (req, res) => {
    const data = await createRoleValidation(req.body);
    const role = await RoleService.createRole(data);
    return BaseController.ok(res, role);
};

const updateRole = async (req, res) => {
    const data = await updateRoleValidation(req.params.roleId, req.body);
    await RoleService.updateRole(req.params.roleId, data);
    return BaseController.ok(res);
};

const deleteRole = async (req, res) => {
    await RoleService.deleteRole(req.params.roleId);
    return BaseController.ok(res);
};

const assignRolesToUser = async (req, res) => {
    const { userId, roles } = await assignRolesToUserValidation(req.body.userId, req.body.roles);
    await RoleService.assignRolesToUser(userId, roles);
    return BaseController.ok(res);
};

module.exports = {
    accessList,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    assignRolesToUser
};