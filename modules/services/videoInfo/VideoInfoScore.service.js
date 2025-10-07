const { Op } = require("sequelize");
const Service = require("../../_default/service");
const { VideoDetailScore, User } = require("../../_default/model");
const RoleService = require("../user/Role.service");
const VideoInfoScoreEntity = require("../../entity/videoInfo/VideoInfoScore.entity");

class VideoInfoScoreService extends Service {

    constructor() {
        super(VideoDetailScore)
    }

    async checkUserIsMainAndGetSectionKeys(user) {

        const userAccess = await RoleService.getUserAccessList(user)

        let sectionKeys = []

        const isMain = user.permission == 'admin' || userAccess.includes('shot-main-score')

        if (isMain) {
            sectionKeys = [...VideoInfoScoreEntity.getAllSectionKeys(), 'shot-main-score']
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

    async getBySection({ videoFileId, section = 'shot-main-score' }) {
        return await VideoDetailScore.findAll({ where: { section, videoFileId } });
    }

    async getItemsOfScore(user) {
        const { userSections, isMain } = await this.checkUserIsMainAndGetSectionKeys(user)

        const allScores = VideoInfoScoreEntity.getVideoInfoScoreList()
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


    async getAllList(user, videoFileId) {
        const { userSections, isMain } = await this.checkUserIsMainAndGetSectionKeys(user)

        const sqlQuery = {
            where: {
                videoFileId, section: userSections
            }
        }

        if (!isMain) {
            sqlQuery.where.userId = user.id
        }

        const scores = await VideoDetailScore.findAll({
            ...sqlQuery,
            include: [{ model: User, as: 'user' }],

        },
        )

        return scores
    }

    async storeMain({ user, videoFileId, scores }) {
        const userId = user.id

        for (const score of scores) {

            const section = 'shot-main-score'
            const findScore = await VideoDetailScore.findOne({
                where: { videoFileId, scoreKey: score.key, section }, // Search for existing record by this value
            });

            if (!findScore) {
                await VideoDetailScore.create({ videoFileId, userId, scoreKey: score.key, score: score.score, section })
            } else {
                await VideoDetailScore.update({ score: score.score }, { where: { videoFileId, scoreKey: score.key, section } })
            }
        }

    }

    async storeBySection({ user, videoFileId, scores }) {
        const userId = user.id

        for (const score of scores) {

            const findScore = await VideoDetailScore.findOne({
                where: { videoFileId, userId, scoreKey: score.key, section: score.section }, // Search for existing record by this value
            });

            if (!findScore) {
                await VideoDetailScore.create({ videoFileId, userId, scoreKey: score.key, score: score.score, section: score.section })
            } else {
                await VideoDetailScore.update({ score: score.score }, { where: { videoFileId, userId, scoreKey: score.key, section: score.section } })
            }
        }
    }

    /**
     * body  [{key , score , section}]
     * @param {*} body 
     */
    async storeScore({ user, videoFileId, scores }) {
        const { isMain } = await this.checkUserIsMainAndGetSectionKeys(user)
        if (isMain) {
            await this.storeMain({ user, videoFileId, scores })
        } else {
            await this.storeBySection({ user, videoFileId, scores })
        }
    }

    async storeScoreGroup(userId, videoFileIds, scores){
        const section = 'shot-main-score'

        await VideoDetailScore.destroy({
            where: {
                videoFileId: videoFileIds,
                section
            }
        });

        let insertData = [];
        for(const videoFileId of videoFileIds){
            for (const score of scores) {
                insertData.push({
                    videoFileId, 
                    userId, 
                    section,
                    scoreKey: score.key, 
                    score: score.score, 
                })
            }

            if(insertData.length > 100){
                await VideoDetailScore.bulkCreate(insertData);
                insertData = [];
            }
        }

        if(insertData.length > 0){
            await VideoDetailScore.bulkCreate(insertData);
        }

        return;
    }
}

module.exports = VideoInfoScoreService;