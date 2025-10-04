const { log } = require("../../../helper/showLog");
const BaseController = require("../../_default/controller/Base.controller");
const LoginResponse = require("../../dto/user/Login.response");
const UserInfoResponse = require("../../dto/user/UserInfo.response");
const AuthService = require("../../services/user/Auth.service");
const RoleService = require("../../services/user/Role.service");


async function checkLogin(req, res) {
    const userAccess = await RoleService.getUserAccessList(req.user)
    req.user.access = userAccess;
    return BaseController.ok(res, UserInfoResponse.create(req.user));
}

async function login(req, res) {
    const body = req.body;
    const { token, user } = await AuthService.login(body.phone, body.password);
    return BaseController.ok(res, LoginResponse.create({ token, user }));
}

async function logout(req, res) {
    const { user, token } = req;
    await AuthService.logout(token, user.id);

    return BaseController.ok(res)
}


module.exports = {
    checkLogin,
    login,
    logout
};