const { getDataFromReqQuery } = require("../../../helper/general.tool");
const BaseController = require("../../_default/controller/Base.controller");
const UserList_DTO = require("../../dto/user/UserList.dto");
const UserService = require("../../services/user/User.service");
const UserValidation = require("../../validation/user/User.validation");

class UserController {

    async getUserList(req, res){
        const query = getDataFromReqQuery(req);
        const users = await UserService.getUsers(query);

        return BaseController.ok(res, { users: UserList_DTO.create(users.users), count: users.count })
    }

    async userRegister(req, res){
        const body = req.body;

        const validData = await UserValidation.createUser(body);
        const user = await UserService.createUser(validData, validData.permission);

        return BaseController.ok(res, { user });
    }

    async updateInfo(req, res){
        const body = req.body;
        const { userId } = req.params;

        const validData = await UserValidation.updateUserInfo(body);
        await UserService.updateUserInfo(userId, validData);

        return BaseController.ok(res);
    }

    async changeUserPassword(req, res){
        const body = req.body;
        const { userId } = req.params;
        const { password } = UserValidation.changePassword(body);
        await UserService.changePassword(userId, password);
        return BaseController.ok(res);

    }

    async changePassword(req, res){
        const body = req.body;
        const user = req.user;
        
        const { password } = UserValidation.changePassword(body);
        await UserService.changePassword(user.id, password);
        return BaseController.ok(res);
    }

    async changeUserIsActive(req, res){
        const { userId } = req.body;
        
        const isActive = await UserService.changeIsActive(userId);
        return BaseController.ok(res, { isActive });
    }
}

module.exports = new UserController();