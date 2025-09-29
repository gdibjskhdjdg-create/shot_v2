const { Op } = require("sequelize");
const Service = require("../../_default/service");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");
const { ShotScore, User } = require("../../_default/model");
const RoleService = require("../../services/user/Role.service");

class ShotScoreService extends Service {

    constructor() {
        super(ShotScore)
    }

    async checkUserIsMainAndGetSectionKeys(user) {

        const userAccess = await RoleService.getUserAccessList(user)

        let sectionKeys = []

        const isMain = user.permission == 'admin' || userAccess.includes('shot-main-score')

        if (isMain) {
            sectionKeys = [...ShotScoreEntity.getAllSectionKeys(), 'shot-main-score']
        } else {
            if (userAccess.includes('shot-list-score')) {
                sectionKeys.push('shot-list-score')
            }
            if (userAccess.includes('shot-equalize-score')) {
                sectionKeys.push('shot-equalize-score')
            }
            if (userAccess.includes('shot-editing-score')) {
                sectionKeys.push('shot-editing-score')
            }
        }

        return { userSections: sectionKeys, isMain }
    }

    async getBySection({ shotId, section = 'shot-main-score' }) {
        return await ShotScore.findAll({ where: { section, shotId } });
    }

    async getItemsOfScore(user) {
        const { userSections, isMain } = await this.checkUserIsMainAndGetSectionKeys(user)

        const allScores = ShotScoreEntity.getShotScoreList()
        const result = []

        for (const score of allScores) {
            const { key, title, sectionKey } = score

            if (isMain) {
                result.push({ ...score, isMain })

            } else
                if (userSections.includes(sectionKey)) {
                    result.push(score)
                }
        }

        return result;
    }


    async getAllList(user, shotId) {
        const { userSections, isMain } = await this.checkUserIsMainAndGetSectionKeys(user)

        const sqlQuery = {
            where: {
                shotId, section: userSections
            }
        }

        if (!isMain) {
            sqlQuery.where.userId = user.id
        }

        const scores = await ShotScore.findAll({
            ...sqlQuery,
            include: [{ model: User, as: 'user' }],

        },
        )

        return scores
    }

    async storeMain({ user, shotId, scores }) {
        const userId = user.id

        for (const score of scores) {

            const section = 'shot-main-score'
            const findScore = await ShotScore.findOne({
                where: { shotId, scoreKey: score.key, section }, // Search for existing record by this value
            });

            if (!findScore) {
                await ShotScore.create({ shotId, userId, scoreKey: score.key, score: score.score, section })
            } else {
                await ShotScore.update({ score: score.score }, { where: { shotId, scoreKey: score.key, section } })
            }
        }

    }

    async storeBySection({ user, shotId, scores }) {
        const userId = user.id

        for (const score of scores) {

            const findScore = await ShotScore.findOne({
                where: { shotId, userId, scoreKey: score.key, section: score.section }, // Search for existing record by this value
            });

            if (!findScore) {
                await ShotScore.create({ shotId, userId, scoreKey: score.key, score: score.score, section: score.section })
            } else {
                await ShotScore.update({ score: score.score }, { where: { shotId, userId, scoreKey: score.key, section: score.section } })
            }
        }
    }

    /**
     * body  [{key , score , section}]
     * @param {*} body 
     */
    async storeScore({ user, shotId, scores }) {
        const { isMain } = await this.checkUserIsMainAndGetSectionKeys(user)
        if (isMain) {
            await this.storeMain({ user, shotId, scores })
        } else {
            await this.storeBySection({ user, shotId, scores })
        }
    }
}

module.exports = ShotScoreService;