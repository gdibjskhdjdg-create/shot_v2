const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const Service = require("../../_default/service");
const TypeTool = require("../../../helper/type.tool");
const { generatePassword } = require("./Password.service");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");

const { User, Role } = require("../../_default/model");

class UserService extends Service {

    constructor() {
        super(User)
    }

    async getUsers(filters = {}) {
        const {
            page = null,
            take = null,
            fullName = null
        } = filters;

        let sqlQuery = {
            where: { permission: { [Op.not]: "admin" } },
            include: [{
                model: Role,
                attributes: ['id', 'name'],
                as: 'role'
            }],
        };

        if (TypeTool.boolean(fullName)) {
            sqlQuery.where.fullName = { [Op.like]: `%${TypeTool.string(fullName).trim()}%` }
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);
        sqlQuery.order = [['createdAt', 'DESC']];

        const response = await User.findAndCountAll({
            distinct: true,
            attributes: { exclude: ["fullInfo"] },
            ...sqlQuery,
        });

        return {
            users: response.rows,
            count: response.count
        };
    }

    async findByPhone(phone) {
        return await User.findOne({ where: { phone } });
    }

    async findAdmin() {
        return await User.findOne({ where: { permission: "admin" } });
    }

    async createUser(data = {}, permission = "user") {
        const {
            phone,
            firstName,
            lastName,
            password,
        } = data;

        let hashPassword = await generatePassword(password)

        const user = await User.create({
            phone,
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            permission,
            password: hashPassword
        });

        return user;
    }

    async updateUserInfo(userId, data = {}) {
        const {
            firstName,
            lastName,
            permission,
        } = data;

        const dataToUpdate = {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
        }

        if (permission) {
            dataToUpdate.permission = permission;
        }

        await User.update(dataToUpdate, { where: { id: userId } });

        return;
    }

    async changeIsActive(userId) {
        const user = await this.getById(userId);
        user.isActive = user.isActive == 1 ? 0 : 1;
        await user.save();

        return user.isActive;
    }

    async changePassword(userId, password) {
        const user = await this.getById(userId);

        user.password = await generatePassword(password);

        await user.save();

        return true;
    }

}

module.exports = new UserService()