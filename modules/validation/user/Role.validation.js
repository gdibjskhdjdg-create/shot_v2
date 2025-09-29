const TypeTool = require("../../../helper/type.tool");
const Validation = require("../../_default/validation");
const AccessEntity = require("../../entity/user/Access.entity");
const RoleService = require("../../services/user/Role.service");
const UserService = require("../../services/user/User.service")

class RoleValidation extends Validation {
    constructor() {
        super();
    }

    async createRole(data = {}) {

        const {
            name, access
        } = data;

        this.setEmpty()

        if (TypeTool.isNullUndefined(name) || name.length < 2) {
            this.setError("name atleast  2 characters")
        } else {
            const findRoleByName = await RoleService.findRoleByName(name)
            if (findRoleByName) {
                this.setError("name is already exists")
            } else {
                this.setValidData("name", name);
            }
        }

        if (access.length) {
            const contains = AccessEntity.getAllAccessKeys().some(key => {
                return access.includes(key);
            });

            if (contains) {
                this.setValidData("access", access);
            } else {
                this.setError("invalid access")
            }
        }


        return this.getResult();
    }

    async updateRole(roleId, data = {}) {

        const {
            name,
            access
        } = data;

        this.setEmpty()

        if (!TypeTool.isNullUndefined(name)) {
            if (name.length < 2) {
                this.setError("name must be more than 2 characters")
            } else {
                const findRoleByName = await RoleService.findRoleByName(name)
                if (findRoleByName && findRoleByName.id != roleId) {
                    this.setError("name is exists")
                }
            }

            this.setValidData("name", name);
        }

        if (!TypeTool.isNullUndefined(access)) {
            if (access.length == 0) {
                this.setValidData("access", []);
            } else {
                const contains = AccessEntity.getAllAccessKeys().some(key => {
                    return access.includes(key);
                });

                if (contains) {
                    this.setValidData("access", access);
                } else {
                    this.setError("invalid access")
                }
            }
        }

        return this.getResult();
    }

    async assignRolesToUser(userId, rolesId = []) {

        this.setEmpty()

        const user = await UserService.getById(userId)

        const roles = await RoleService.getByIds(rolesId)
        if (rolesId.length != roles.length) {
            this.setError("invalid roles")
        }

        this.setValidData("userId", userId);
        this.setValidData("roles", rolesId);

        return this.getResult();

    }

    async assignRole2User(roleId, userId) {

        const role = await RoleService.getById(roleId)
        const user = await UserService.getById(userId)

        const userHasRole = await RoleService.userHasRole(roleId, userId)
        if (!userHasRole) {
            this.setValidData("roleId", roleId);
            this.setValidData("userId", userId);
        } else {
            this.setError("user has not role")
        }


        return this.getResult();

    }

    async removeRoleFromUser(roleId, userId) {
        const role = await RoleService.getById(roleId)
        const user = await UserService.getById(userId)

        const userHasRole = await RoleService.userHasRole(roleId, userId)
        if (userHasRole) {
            this.setValidData("roleId", roleId);
            this.setValidData("userId", userId);
        } else {
            this.setError("user has not role")
        }


        return this.getResult();

    }

}

module.exports = new RoleValidation();