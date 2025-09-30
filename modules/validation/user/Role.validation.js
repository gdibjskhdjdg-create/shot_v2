const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");
const AccessEntity = require("../../entity/user/Access.entity");
const RoleService = require("../../services/user/Role.service");
const UserService = require("../../services/user/User.service");

const createRoleValidation = async (data = {}) => {
    const {
        name, access
    } = data;

    const validation = new Validation();

    if (TypeTool.isEmpty(name) || name.length < 2) {
        validation.setError("name atleast 2 characters");
    } else {
        const findRoleByName = await RoleService.findRoleByName(name);
        if (findRoleByName) {
            validation.setError("name is already exists");
        } else {
            validation.setValidData("name", name);
        }
    }

    if (access && access.length) {
        const contains = AccessEntity.getAllAccessKeys().some(key => access.includes(key));
        if (contains) {
            validation.setValidData("access", access);
        } else {
            validation.setError("invalid access");
        }
    }

    return validation.getResult();
};

const updateRoleValidation = async (roleId, data = {}) => {
    const {
        name, access
    } = data;

    const validation = new Validation();

    if (name !== undefined) {
        if (name.length < 2) {
            validation.setError("name must be more than 2 characters");
        } else {
            const findRoleByName = await RoleService.findRoleByName(name);
            if (findRoleByName && findRoleByName.id != roleId) {
                validation.setError("name is exists");
            }
        }
        validation.setValidData("name", name);
    }

    if (access !== undefined) {
        if (access.length === 0) {
            validation.setValidData("access", []);
        } else {
            const contains = AccessEntity.getAllAccessKeys().some(key => access.includes(key));
            if (contains) {
                validation.setValidData("access", access);
            } else {
                validation.setError("invalid access");
            }
        }
    }

    return validation.getResult();
};

const assignRolesToUserValidation = async (userId, rolesId = []) => {
    const validation = new Validation();

    await UserService.getById(userId);

    const roles = await RoleService.getByIds(rolesId);
    if (rolesId.length !== roles.length) {
        validation.setError("invalid roles");
    }

    validation.setValidData("userId", userId);
    validation.setValidData("roles", rolesId);

    return validation.getResult();
};

const assignRole2UserValidation = async (roleId, userId) => {
    const validation = new Validation();

    await RoleService.getById(roleId);
    await UserService.getById(userId);

    const userHasRole = await RoleService.userHasRole(roleId, userId);
    if (!userHasRole) {
        validation.setValidData("roleId", roleId);
        validation.setValidData("userId", userId);
    } else {
        validation.setError("user has not role");
    }

    return validation.getResult();
};

const removeRoleFromUserValidation = async (roleId, userId) => {
    const validation = new Validation();

    await RoleService.getById(roleId);
    await UserService.getById(userId);

    const userHasRole = await RoleService.userHasRole(roleId, userId);
    if (userHasRole) {
        validation.setValidData("roleId", roleId);
        validation.setValidData("userId", userId);
    } else {
        validation.setError("user has not role");
    }

    return validation.getResult();
};

module.exports = {
    createRoleValidation,
    updateRoleValidation,
    assignRolesToUserValidation,
    assignRole2UserValidation,
    removeRoleFromUserValidation
};