const Sequelize = require('sequelize');
// const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

const Service = require("../../_default/service");
const { Tag, TagLocation, TagEvent, TagRelCategory, CategoryTag, sequelize } = require("../../_default/model");
// const { createPaginationQuery } = require('../../../helper/SqlHelper.tool');
const ErrorResult = require('../../../helper/error.tool');


class KeywordCategoryService extends Service {

    constructor() {
        super(CategoryTag)
    }

    async getTagCategories(filters = {}) {

        const page = filters.page || 1
        const take = filters.take || 10
        const search = filters.search || ""

        const sqlQueryForCount = `SELECT count(*) over() as total FROM categories_of_tag where name like :search limit 1;`
        const sqlQuery = `SELECT COUNT(tag_category."categoryId") as "tagCount" , categories_of_tag.id as categoryId, categories_of_tag.name as "categoryName" FROM categories_of_tag LEFT JOIN tag_category ON categories_of_tag.id = tag_category."categoryId" where categories_of_tag.name like :search GROUP BY categories_of_tag.id LIMIT :take offset :offset;`

        const replacements = { search: `%${search}%`, offset: (page - 1) * take, take }

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        return { count: totalItems?.[0]?.total || 0, rows }
    }

    async getTagDetail(tagId) {
        let tag = await this.getById(tagId);
        tag = tag.toJSON();

        if (tag.type === "event") {
            tag.event = await TagEvent.findOne({ where: { id: tag.typeId } });
        }
        else if (tag.type === "location") {
            tag.location = await TagLocation.findOne({ where: { id: tag.typeId } });
        }

        return tag
    }

    async showCategory(categoryId) {
        const category = await CategoryTag.findOne({
            where: { id: categoryId }, include: [{
                model: Tag,
                as: 'tags'
            }
            ]
        });
        return category
    }

    async createCategory(data) {
        const {
            name,
            tagIds = []
        } = data;

        const checkCategory = await CategoryTag.findOne({ where: { name } });
        if (checkCategory) {
            throw ErrorResult.badRequest("name is duplicated")
        }
        else {
            const categoryModel = await CategoryTag.create({ name });
            await categoryModel.save();

            await this.updateTagsCategory(categoryModel.id, tagIds);

            return categoryModel;
        }

    }

    async editCategory(categoryId, data = {}) {
        const {
            name,
            tagIds = []
        } = data;

        const categoryModel = await this.getById(categoryId);
        if (categoryModel.name != name) {
            categoryModel.name = name;
        }
        await categoryModel.save();

        await this.updateTagsCategory(categoryModel.id, tagIds);

        return categoryModel;
    }

    async deleteCategory(categoryId) {
        const categoryModel = await this.getById(categoryId);
        await categoryModel.destroy();
        return true;
    }

    async updateTagsCategory(categoryId, tagsId) {

        await TagRelCategory.destroy({
            where: {
                categoryId
            }
        })

        const data = []
        for (const tagId of tagsId) {
            data.push({ categoryId, tagId })
        }

        return await TagRelCategory.bulkCreate(data);

    }
}

module.exports = new KeywordCategoryService();