const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const TypeTool = require("../../../helper/type.tool");
const { generatePassword } = require("./Password.service");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");

const { User, Role } = require("../../_default/model");

const getUsers = async (filters = {}) => {
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

    if (TypeTool.isnotEmpty(fullName)) {
        sqlQuery.where.fullName = { [Op.like]: `%${String(fullName).trim()}%` };
    }

    sqlQuery = createPaginationQuery(sqlQuery, page, take);
    sqlQuery.order = [['createdAt', 'DESC']];

    const { rows, count } = await User.findAndCountAll({
        distinct: true,
        attributes: { exclude: ["fullInfo"] },
        ...sqlQuery,
    });

    return { users: rows, count };
};

const findUserByPhone = async (phone) => {
    return await User.findOne({ where: { phone } });
};

const findAdminUser = async () => {
    return await User.findOne({ where: { permission: "admin" } });
};

const getById = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}

const createUser = async (data = {}, permission = "user") => {
    const {
        phone,
        firstName,
        lastName,
        password,
    } = data;

    const hashedPassword = await generatePassword(password);

    const user = await User.create({
        phone,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        permission,
        password: hashedPassword
    });

    return user;
};

const updateUserInfo = async (userId, data = {}) => {
    const {
        firstName,
        lastName,
        permission,
    } = data;

    const dataToUpdate = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
    };

    if (permission) {
        dataToUpdate.permission = permission;
    }

    await User.update(dataToUpdate, { where: { id: userId } });
};

const toggleUserActiveStatus = async (userId) => {
    const user = await getById(userId);
    user.isActive = !user.isActive;
    await user.save();

    return user.isActive;
};

const changePassword = async (userId, password) => {
    const user = await getById(userId);
    user.password = await generatePassword(password);
    await user.save();
    return true;
};

module.exports = {
    getUsers,
    findUserByPhone,
    findAdminUser,
    createUser,
    updateUserInfo,
    toggleUserActiveStatus,
    changePassword,
    getById,
};
