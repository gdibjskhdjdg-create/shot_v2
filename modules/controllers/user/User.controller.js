const BaseController = require("../../_default/controller/Base.controller");
const UserService = require("../../services/user/User.service");
const { createUserValidation, updateUserInfoValidation, changePasswordValidation } = require("../../validation/user/User.validation");

const listUsers = async (req, res) => {
    const users = await UserService.getUsers(req.query);
    return BaseController.ok(res, users);
};

const getUserById = async (req, res) => {
    const user = await UserService.getById(req.params.userId);
    return BaseController.ok(res, user);
};

const createNewUser = async (req, res) => {
    const data = await createUserValidation(req.body);
    const user = await UserService.createUser(data);
    return BaseController.ok(res, user);
};

const updateUser = async (req, res) => {
    const data = await updateUserInfoValidation(req.body);
    await UserService.updateUserInfo(req.params.userId, data);
    return BaseController.ok(res);
};

const updateUserPassword = async (req, res) => {
    const data = await changePasswordValidation(req.body);
    await UserService.changePassword(req.params.userId, data.password);
    return BaseController.ok(res);
};
const updatePassword = async (req, res) => {
    const data = await changePasswordValidation(req.body);
    await UserService.changePassword(req.user.id, data.password);
    return BaseController.ok(res);
};
const toggleUserStatus = async (req, res) => {
    const result = await UserService.toggleUserActiveStatus(req.params.userId);
    return BaseController.ok(res, { isActive: result });
};

module.exports = {
    listUsers,
    getUserById,
    createNewUser,
    updateUser,
    updatePassword,
    updateUserPassword,
    toggleUserStatus
};