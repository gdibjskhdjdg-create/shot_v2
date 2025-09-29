const BaseController = require("../../_default/controller/Base.controller");
const LoginDTO = require("../../dto/user/Login.dto");
const UserInfoDTO = require("../../dto/user/UserInfo.dto");
const AuthService = require("../../services/user/Auth.service");
const RoleService = require("../../services/user/Role.service");


class AuthController {

    async checkLogin(req, res){
        const userAccess = await RoleService.getUserAccessList(req.user)
        req.user.access = userAccess;
        return BaseController.ok(res, UserInfoDTO.create(req.user));
    }

    async login(req, res){
        const body = req.body;
        const { token, user } = await AuthService.login(body.phone, body.password);
        return BaseController.ok(res, LoginDTO.create({ token, user }));
    }

    async logout(req, res){
        const { user, token } = req;
        await AuthService.logout(token, user.id);

        return BaseController.ok(res)
    }
}

module.exports = new AuthController();