const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const TypeTool = require("../../../helper/type.tool");

const { Role, UserRelRole } = require("../../_default/model");
const Redis = require("../../../db/redis");
const AuthService = require('./Auth.service');

const getRoles = async (filter = {}) => {
    const { search = null } = filter;
    const where = {};
    if (TypeTool.isnotEmpty(search)) {
        where.name = { [Op.like]: `%${String(search).trim()}%` };
    }
    return await Role.findAll({ where });
};

const findRoleByName = async (name) => {
    return await Role.findOne({ where: { name } });
};

const getRedisKeyRolesAccess = () => 'roles_access';

const cacheRolesAccess = async () => {
    const key = getRedisKeyRolesAccess();
    const roles = await getRoles();
    
    const roleItems = roles.map(x => x.toJSON());
    const cached = {};
    for (const role of roleItems) {
        cached[role.id] = JSON.parse(role.access);
    }
    await Redis.set(key, JSON.stringify(cached));
    return cached;
};

const getCachedRolesAccess = async () => {
    const key = getRedisKeyRolesAccess();
    let cached = await Redis.get(key);
    if (!cached) {
        cached = await cacheRolesAccess();
    } else {
        cached = JSON.parse(cached);
    }

    return cached;
};

const getById = async (id) => {
    const role = await Role.findByPk(id);
    if (!role) {
        throw new Error("Role not found");
    }
    return role;
};

const getByIds = async (ids) => {
    const roles = await Role.findAll({ where: { id: ids } });
    return roles;
};

const createRole = async (body) => {
    const { name, access } = body;
    const newRole = await Role.create({ name, access: JSON.stringify(access) });
    await cacheRolesAccess();
    return newRole;
};

const updateRole = async (id, body) => {
    const { name, access } = body;

    const role = await getById(id);
    if (name !== undefined) {
        role.name = name;
    }
    if (access !== undefined) {
        role.access = JSON.stringify(access);
    }

    await role.save();

    await cacheRolesAccess();
};

const deleteRole = async (roleId) => {
    // get users by roleId
    const roleUsers = await getRoleUserByRoleId(roleId);
    const userIds = [...new Set(roleUsers.map(x => x.userId))];

    const role = await getById(roleId);
    await role.destroy();

    // cached all roles of users again
    for (const userId of userIds) {
        await cacheUserRoles(userId);
    }

    // cached role access again
    await cacheRolesAccess();
};

const assignRolesToUser = async (userId, roleIds) => {
    await UserRelRole.destroy({ where: { userId } });

    const roles = roleIds.map(id => ({ roleId: id, userId: +userId }));

    await UserRelRole.bulkCreate(roles);

    await cacheUserRoles(userId);
};

const getRoleUserByRoleId = async (roleId) => {
    return await UserRelRole.findAll({ where: { roleId } });
};

const getUserRoles = async (userId) => {
    return await UserRelRole.findAll({ where: { userId } });
};

const getUserAccessList = async (user) => {
    const userRoleIds = user.role;
    const rolesAccess = await getCachedRolesAccess();

    let userAccess = [];
    for (const roleId of userRoleIds) {
        if (rolesAccess[String(roleId)]) {
            userAccess.push(...rolesAccess[String(roleId)]);
        }
    }

    return [...new Set(userAccess)];
};

const cacheUserRoles = async (userId) => {
    const userRoles = await getUserRoles(userId);
    const roleIds = userRoles.map(x => x.toJSON()).map(x => x.roleId);
    await AuthService.updateUserTokensInRedis(userId, { role: roleIds });
};

const userHasRole = async (roleId, userId) => {
    return await UserRelRole.findOne({ where: { roleId, userId } });
};

module.exports = {
    getRoles,
    findRoleByName,
    getCachedRolesAccess,
    createRole,
    updateRole,
    deleteRole,
    assignRolesToUser,
    getUserRoles,
    getUserAccessList,
    cacheUserRoles,
    userHasRole,
    getByIds,
    getById
};