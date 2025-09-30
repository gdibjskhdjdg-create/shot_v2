const BaseController = require("../../_default/controller/Base.controller");
const AuthService = require("../../services/user/Auth.service");
const RoleService = require("../../services/user/Role.service");
const UserInfoDTO = require("../../dto/user/UserInfo.dto");
const LoginDTO = require("../../dto/user/Login.dto");

const login = async (req, res) => {
    const { phone, password } = req.body;
    const result = await AuthService.login(phone, password);
    return BaseController.ok(res, LoginDTO.create(result));
};


const checkLogin = async (req, res)=>{
    const userAccess = await RoleService.getUserAccessList(req.user)
    req.user.access = userAccess;
    return BaseController.ok(res, UserInfoDTO.create(req.user));
}


const logout = async (req, res) => {
    await AuthService.logout(req.token, req.user.id);
    return BaseController.ok(res);
};

const getMe = async (req, res) => {
    return BaseController.ok(res, UserInfoDTO.create(req.user));
};

module.exports = {
    checkLogin,
    login,
    logout,
    getMe
};