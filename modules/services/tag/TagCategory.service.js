
const { QueryTypes } = require('sequelize');
const { Tag, TagLocation, TagEvent, TagRelCategory, CategoryTag, sequelize } = require("../../_default/model");
const ErrorResult = require('../../../helper/error.tool');

const updateForCategory = async (categoryId, tagsId) => {
    await TagRelCategory.destroy({
        where: {
            categoryId
        }
    });

    const data = tagsId.map(tagId => ({ categoryId, tagId }));
    return await TagRelCategory.bulkCreate(data);
};

const getCategories = async (filters = {}) => {
    const page = filters.page || 1;
    const take = filters.take || 10;
    const search = filters.search || "";

    const sqlQueryForCount = `SELECT count(*) over() as total FROM categories_of_tag where name like :search limit 1;`;
    const sqlQuery = `SELECT COUNT(tag_category."categoryId") as "tagCount", categories_of_tag.id as categoryId, categories_of_tag.name as "categoryName" FROM categories_of_tag LEFT JOIN tag_category ON categories_of_tag.id = tag_category."categoryId" where categories_of_tag.name like :search GROUP BY categories_of_tag.id LIMIT :take offset :offset;`;

    const replacements = { search: `%${search}%`, offset: (page - 1) * take, take };

    const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
    const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

    return { count: totalItems?.[0]?.total || 0, rows };
};

const getDetail = async (tagId) => {
    let tag = await Tag.findByPk(tagId);
    if (!tag) return null;

    tag = tag.toJSON();

    if (tag.type === "event") {
        tag.event = await TagEvent.findOne({ where: { id: tag.typeId } });
    } else if (tag.type === "location") {
        tag.location = await TagLocation.findOne({ where: { id: tag.typeId } });
    }

    return tag;
};

const showCategory = async (categoryId) => {
    const category = await CategoryTag.findOne({
        where: { id: categoryId },
        include: [{
            model: Tag,
            as: 'tags'
        }]
    });
    return category;
};

const createCategory = async (data) => {
    const {
        name,
        tagIds = []
    } = data;

    const checkCategory = await CategoryTag.findOne({ where: { name } });
    if (checkCategory) {
        throw ErrorResult.badRequest("name is duplicated");
    }

    const categoryModel = await CategoryTag.create({ name });
    await updateForCategory(categoryModel.id, tagIds);

    return categoryModel;
};

const editCategory = async (categoryId, data = {}) => {
    const {
        name,
        tagIds = []
    } = data;

    const categoryModel = await CategoryTag.findByPk(categoryId);
    if (!categoryModel) {
        throw new Error('Category not found');
    }

    if (categoryModel.name !== name) {
        categoryModel.name = name;
        await categoryModel.save();
    }

    await updateForCategory(categoryModel.id, tagIds);

    return categoryModel;
};

const deleteCategory = async (categoryId) => {
    const categoryModel = await CategoryTag.findByPk(categoryId);
    if(categoryModel) {
        await categoryModel.destroy();
    }
    return true;
};

module.exports = {
    getCategories,
    getDetail,
    showCategory,
    createCategory,
    editCategory,
    deleteCategory,
    updateForCategory
};