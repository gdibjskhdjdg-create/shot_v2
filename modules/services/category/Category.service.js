const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes
const { Category, ShotRelCategory, sequelize } = require("../../_default/model");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const TypeTool = require("../../../helper/type.tool");

class CategoryService extends SampleCRUD_Service {
    constructor() {
        super(Category)
    }

    async getList(filters = {}) {
        const {
            shotId = "",
            search = null,
            type = null,
            page = null,
            take = null,
            shotUsageCount = false,
        } = filters;


        let sqlQuery = {
            where: {},
            include: []
        };

        if (!TypeTool.isNullUndefined(search) && search.toString().trim().length > 0) {
            sqlQuery.where.name = { [Op.like]: `%${search}%` }
        }
        if (!TypeTool.isNullUndefined(type)) {
            sqlQuery.where.type = type;
        }

        if (TypeTool.isNotEmptyString(shotId)) {
            sqlQuery.include.push({
                model: ShotRelCategory,
                as: `shot_category`,
                where: { shotId },
                required: true,
            })
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let category = await Category.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });

        if (shotUsageCount) {
            let categoriesId = category.rows.map(item => item.id);
            const counts = await this.getCategoryUsageCount(categoriesId);

            category.rows = category.rows.map(item => {
                const countOfCategory = counts.find(it => it.categoryId === item.id);
                if (countOfCategory) {
                    item.dataValues.count = countOfCategory.count;
                }
                else {
                    item.dataValues.count = 0;
                }
                return item;
            })
        }
        return category;
    }

    async getCategoryUsageCount(categoriesId) {
        let counts = await ShotRelCategory.findAll({
            where: { categoryId: categoriesId },
            group: ['categoryId'],
            attributes: ['categoryId', [Sequelize.fn('count', Sequelize.col('shotId')), 'count']],
        })

        return counts.map(item => item.toJSON());
    }

    async getShotsOfCategory(categoryId, query = {}) {
        const page = query.page || 1;
        const take = query.take || 10;
        const offset = (+page - 1) * +take;

        // Simplified and optimized version
        // const sqlQueryForCount = `
        //     SELECT COUNT(DISTINCT s.id) as total
        //     FROM shots s
        //     WHERE EXISTS (
        //         SELECT 1 FROM shot_category sc 
        //         WHERE sc."shotId" = s.id AND sc."categoryId" = :categoryId
        //     )
        // `;

        // const sqlQuery = `
        //     SELECT 
        //         s.id as "shotId",
        //         s.title as "shotTitle",
        //         COUNT(sc."shotId") as "categoryCount"
        //     FROM shots s
        //     INNER JOIN shot_category sc ON s.id = sc."shotId"
        //     WHERE sc."categoryId" = :categoryId
        //     GROUP BY s.id 
        //     LIMIT :take OFFSET :offset
        // `;



        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_category AS "categoriesId" WHERE ("categoriesId"."categoryId" =:categoryId AND "categoriesId"."shotId" = Shot.id) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_category AS "categoriesId" ON Shot.id = "categoriesId"."shotId" AND "categoriesId"."categoryId"=:categoryId group by Shot.id limit 1;`

        const sqlQuery = `SELECT count(Shot.id) as "categoryCount", Shot.id as "shotId", Shot.title as "shotTitle" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_category AS "categoriesId" WHERE ("categoriesId"."categoryId" =:categoryId AND "categoriesId"."shotId" = Shot.id) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_category AS "categoriesId" ON Shot.id = "categoriesId"."shotId" AND "categoriesId"."categoryId" =:categoryId group by Shot.id, Shot.title ;` // <-- add Shot.title


        const replacements = {
            categoryId,
            offset: offset,
            take: +take
        };

        const totalItems = await sequelize.query(sqlQueryForCount, {
            replacements,
            type: QueryTypes.SELECT
        });

        const rows = await sequelize.query(sqlQuery, {
            replacements,
            type: QueryTypes.SELECT
        });

        return {
            count: parseInt(totalItems?.[0]?.total) || 0,
            rows
        };
    }

    async detachShotFromCategory(categoryId, shotId) {
        return await ShotRelCategory.destroy({
            where: {
                categoryId,
                shotId
            }
        })
    }

    async findOrCreateCategory(categories) {
        let cats = []
        for (let i = 0; i < categories.length; i++) {
            let cat = await Category.findOne({ where: { name: categories[i] } });
            if (!cat) cat = Category.create({ name: categories[i] });

            cats.push(cat)
        }

        return cats;
    }

    async checkAndUpdateWithUUID(categories) {
        let newCategories = [];
        for (let i = 0; i < categories.length; i++) {
            const checkCategory = await Category.findOne({ where: { UUID: categories[i].UUID } });
            if (!checkCategory) {
                let t = await Category.create({ name: categories[i].name, UUID: categories[i].UUID });
                newCategories.push(t.toJSON());
            } else {
                if (checkCategory.name !== categories[i].name) {
                    checkCategory.name = categories[i].name;
                    await checkCategory.save();
                }
                newCategories.push(checkCategory.toJSON());
            }
        }

        return newCategories;
    }
}

module.exports = new CategoryService();