const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes;

const Service = require('../../_default/service');
const { Keyword, KeywordLocation, KeywordEvent, KeywordRelCategory, CategoryKeyword, sequelize } = require('../../_default/model');
const ErrorResult = require('../../../helper/error.tool');

class KeywordCategoryService extends Service {

    constructor() {
        super(CategoryKeyword);
    }

    async getKeywordCategories(filters = {}) {
        const page = filters.page || 1;
        const take = filters.take || 10;
        const search = filters.search || '';

        const sqlQueryForCount = `SELECT count(*) over() as total FROM categories_of_keyword where name like :search limit 1;`;
        const sqlQuery = `SELECT COUNT(keyword_category."categoryId") as "keywordCount", categories_of_keyword.id as categoryId, categories_of_keyword.name as "categoryName" FROM categories_of_keyword LEFT JOIN keyword_category ON categories_of_keyword.id = keyword_category."categoryId" where categories_of_keyword.name like :search GROUP BY categories_of_keyword.id LIMIT :take offset :offset;`;

        const replacements = { search: `%${search}%`, offset: (page - 1) * take, take };

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        return { count: totalItems?.[0]?.total || 0, rows };
    }

    async getKeywordDetail(keywordId) {
        let keyword = await this.getById(keywordId);
        keyword = keyword.toJSON();

        if (keyword.type === 'event') {
            keyword.event = await KeywordEvent.findOne({ where: { id: keyword.typeId } });
        } else if (keyword.type === 'location') {
            keyword.location = await KeywordLocation.findOne({ where: { id: keyword.typeId } });
        }

        return keyword;
    }

    async showCategory(categoryId) {
        const category = await CategoryKeyword.findOne({
            where: { id: categoryId },
            include: [{
                model: Keyword,
                as: 'keywords'
            }]
        });
        return category;
    }

    async createCategory(data) {
        const {
            name,
            keywordIds = []
        } = data;

        const checkCategory = await CategoryKeyword.findOne({ where: { name } });
        if (checkCategory) {
            throw ErrorResult.badRequest('name is duplicated');
        } else {
            const categoryModel = await CategoryKeyword.create({ name });
            await categoryModel.save();

            await this.updateKeywordsCategory(categoryModel.id, keywordIds);

            return categoryModel;
        }
    }

    async editCategory(categoryId, data = {}) {
        const {
            name,
            keywordIds = []
        } = data;

        const categoryModel = await this.getById(categoryId);
        if (categoryModel.name !== name) {
            categoryModel.name = name;
        }
        await categoryModel.save();

        await this.updateKeywordsCategory(categoryModel.id, keywordIds);

        return categoryModel;
    }

    async deleteCategory(categoryId) {
        const categoryModel = await this.getById(categoryId);
        await categoryModel.destroy();
        return true;
    }

    async updateKeywordsCategory(categoryId, keywordsId) {
        await KeywordRelCategory.destroy({
            where: {
                categoryId
            }
        });

        const data = [];
        for (const keywordId of keywordsId) {
            data.push({ categoryId, keywordId });
        }

        return await KeywordRelCategory.bulkCreate(data);
    }
}

module.exports = new KeywordCategoryService();