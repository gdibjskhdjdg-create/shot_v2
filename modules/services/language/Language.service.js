const SampleCRUD_Service = require("../../_default/service/SampleCRUD.service");
const { Language, ShotRelLanguage, sequelize } = require("../../_default/model");
const TypeTool = require("../../../helper/type.tool");
const { createPaginationQuery } = require("../../../helper/SqlHelper.tool");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

class LanguageService extends SampleCRUD_Service {
    constructor() {
        super(Language)
    }

    async getList(filters = {}) {
        const {
            languageId = "",
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

        if (TypeTool.isNotEmptyString(languageId)) {
            sqlQuery.include.push({
                model: ShotRelLanguage,
                as: `shot_languages`,
                where: { languageId },
                required: true,
            })
        }

        sqlQuery = createPaginationQuery(sqlQuery, page, take);

        let language = await Language.findAndCountAll({
            distinct: true,
            ...sqlQuery,
        });

        if (shotUsageCount) {
            let languagesId = language.rows.map(item => item.id);
            const counts = await this.getLanguageUsageCount(languagesId);


            language.rows = language.rows.map(item => {
                const countOfLanguage = counts.find(it => it.languageId === item.id);
                if (countOfLanguage) {
                    item.dataValues.count = countOfLanguage.count;
                }
                else {
                    item.dataValues.count = 0;
                }
                return item;
            })
        }
        return language;
    }


    async getLanguageUsageCount(langsId) {
        let counts = await ShotRelLanguage.findAll({
            where: { languageId: langsId },
            group: ['languageId'],
            attributes: ['languageId', [Sequelize.fn('count', Sequelize.col('shotId')), 'count']],
        })

        return counts.map(item => item.toJSON());
    }

    async getShotsOfLanguage(languageId, query = {}) {

        const page = query.page || 1
        const take = query.take || 10

        const sqlQueryForCount = `SELECT count(*) over() as total FROM (SELECT * FROM shots AS Shot WHERE ( SELECT "shotId" FROM shot_languages AS "languagesId" WHERE ("languagesId"."languageId"  =:languageId  AND "languagesId"."shotId" = Shot.id) LIMIT 1 ) IS NOT NULL ) AS Shot INNER JOIN shot_languages AS "languagesId" ON Shot.id = "languagesId"."shotId" AND "languagesId"."languageId" =:languageId  group by Shot.id limit 1;`

        const sqlQuery = `SELECT count(Shot.id) as "languageCount", Shot.id as "shotId", Shot.title as "shotTitle" FROM (SELECT * FROM shots AS Shot WHERE ( SELECT Shot.id FROM shot_languages AS "languagesId" WHERE ("languagesId"."languageId"=:languageId  AND "languagesId"."shotId" = Shot.id) LIMIT 1 ) IS NOT NULL limit :take offset :offset ) AS Shot INNER JOIN shot_languages AS "languagesId" ON Shot.id = "languagesId"."shotId" AND "languagesId"."languageId"=:languageId group by Shot.id , Shot.title ;` // <-- add shot title

        const replacements = { languageId, offset: (+page - 1) * +take, take }

        const totalItems = (await sequelize.query(sqlQueryForCount, { replacements, type: QueryTypes.SELECT }));
        const rows = await sequelize.query(sqlQuery, { replacements, type: QueryTypes.SELECT });

        return { count: totalItems?.[0]?.total || 0, rows }
    }

    async detachShotFromLanguage(languageId, shotId) {
        return await ShotRelLanguage.destroy({
            where: {
                languageId,
                shotId
            }
        })
    }

    async findOrCreateLanguage(languages){
        let langs = []
        for(let i = 0; i < languages.length; i++){
            let lang = await Language.findOne({ where: { name: languages[i] }});
            if(!lang) lang = Language.create({ name: languages[i] });

            langs.push(lang)
        }

        return langs;
    }

    
    async checkAndUpdateWithUUID(languages){
        let newLanguages = [];
        for(let i = 0; i < languages.length; i++){
            const checkLanguage = await Language.findOne({ where: { UUID: languages[i].UUID } });
            if(!checkLanguage){
                let t = await Language.create({ name: languages[i].name, UUID: languages[i].UUID });
                newLanguages.push(t.toJSON());
            } else {
                if(checkLanguage.name !== languages[i].name){
                    checkLanguage.name = languages[i].name;
                    await checkLanguage.save();
                }
                newLanguages.push(checkLanguage.toJSON());
            }
        }

        return newLanguages;
    }
}

module.exports = new LanguageService();