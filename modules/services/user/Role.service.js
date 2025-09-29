const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Service = require("../../_default/service");
const TypeTool = require("../../../helper/type.tool");

const { Role, UserRelRole } = require("../../_default/model");
const Redis = require("../../../db/redis");
const AuthService = require('./Auth.service');


class RoleService extends Service {

    constructor() {
        super(Role)
    }

    async getRoles(filter = {}) {
        const search = filter.search || null
        if (!TypeTool.isNullUndefined(search)) {
            sqlQuery.where.name = { [Op.like]: `%${TypeTool.string(search).trim()}%` }
        }
        return await Role.findAll({})
    }

    async findRoleByName(name) {
        return await Role.findOne({ where: { name } })
    }

    getRedisKeyRolesAccess() {
        return 'roles_access'
    }

    async cachedRolesIdAccess() {
        const key = this.getRedisKeyRolesAccess()
        const roles = await this.getRoles()
        
        const roleItems = roles.map(x => x.toJSON())
        let cached = {}
        for (const role of roleItems) {
            cached[role.id] = JSON.parse(role.access)
        }
        await Redis.set(key, JSON.stringify(cached))
        return cached;
    }

    async getRolesIdAccessFromCached() {
        const key = this.getRedisKeyRolesAccess()
        let cached = await Redis.get(key)
        if (!cached) {
            cached = await this.cachedRolesIdAccess()
        } else {
            cached = JSON.parse(cached)
        }

        return cached
    }

    async createRole(body) {
        const { name, access } = body
        const newRole = await Role.create({ name, access: JSON.stringify(access) })
        await this.cachedRolesIdAccess()
        return newRole;
    }

    async updateRole(id, body) {
        const { name, access } = body

        const role = await this.getById(id)
        if (!TypeTool.isNullUndefined(name)) {
            role.name = name
        }
        if (!TypeTool.isNullUndefined(access)) {
            role.access = JSON.stringify(access)
        }

        await role.save()

        await this.cachedRolesIdAccess()
    }

    async deleteRole(roleId) {
        // get users by roleId
        const roleUser = await this.getRoleUserByRoleId(roleId)
        const usersId = [...new Set(roleUser.map(x => x.userId))]

        const role = await this.getById(roleId);
        await role.destroy()

        // cached all roles of users again
        for (const userId of usersId) {
            await this.cachedUserRolesId(userId)
        }

        // cached role access again
        await this.cachedRolesIdAccess()

    }

    async assignRolesToUser(userId, rolesId) {
        await UserRelRole.destroy({ where: { userId } })

        let roles = []
        for (const id of rolesId) {
            roles.push({ roleId: id, userId: +userId })
        }

        await UserRelRole.bulkCreate(roles)

        await this.cachedUserRolesId(userId)
    }

    async getRoleUserByRoleId(roleId) {
        return await UserRelRole.findAll({ where: { roleId } })
    }

    async getUserRoles(userId) {
        return await UserRelRole.findAll({ where: { userId } })
    }

    async getUserAccessList(user) {
        const userRolesId = user.role
        const rolesAccess = await this.getRolesIdAccessFromCached();

        let userAccess = [];
        for(const roleId of userRolesId){
            if(rolesAccess[roleId.toString()]){
                userAccess = [...userAccess, ...rolesAccess[roleId.toString()]]
            }
        }

        return userAccess;
    }

    async cachedUserRolesId(userId) {
        const userRoles = await this.getUserRoles(userId)
        const rolesId = userRoles.map(x => x.toJSON()).map(x => x.roleId)
        await AuthService.updateUserTokensInRedis(userId, { role: rolesId })
    }

    async userHasRole(roleId, userId) {
        return await UserRelRole.findOne({ where: { roleId, userId } })
    }

}

module.exports = new RoleService()