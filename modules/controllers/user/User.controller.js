const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const UserListResponse = require("../../dto/user/UserList.response");
const UserService = require("../../services/user/User.service");
const UserValidation = require("../../validation/user/User.validation");


async function getUserList(req, res) {
    const query = getDataFromReqQuery(req);
    const users = await UserService.getUsers(query);

    return BaseController.ok(res, { users: UserListResponse.create(users.users), count: users.count })
}

async function userRegister(req, res) {
    const body = req.body;

    const validData = await UserValidation.createUser(body);
    const user = await UserService.createUser(validData, validData.permission);

    return BaseController.ok(res, { user });
}

async function updateInfo(req, res) {
    const body = req.body;
    const { userId } = req.params;

    const validData = await UserValidation.updateUserInfo(body);
    await UserService.updateUserInfo(userId, validData);

    return BaseController.ok(res);
}

async function changeUserPassword(req, res) {
    const body = req.body;
    const { userId } = req.params;
    const { password } = UserValidation.changePassword(body);
    await UserService.changePassword(userId, password);
    return BaseController.ok(res);

}

async function changePassword(req, res) {
    const body = req.body;
    const user = req.user;

    const { password } = UserValidation.changePassword(body);
    await UserService.changePassword(user.id, password);
    return BaseController.ok(res);
}

async function changeUserIsActive(req, res) {
    const { userId } = req.body;

    const isActive = await UserService.changeIsActive(userId);
    return BaseController.ok(res, { isActive });

}

module.exports = {
    getUserList,
    userRegister,
    updateInfo,
    changeUserPassword,
    changePassword,
    changeUserIsActive
};