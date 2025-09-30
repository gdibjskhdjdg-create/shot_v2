const { Op } = require("sequelize");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");
const { ShotScore, User } = require("../../_default/model");
const RoleService = require("../../services/user/Role.service");

const getUserScoreSections = async (user) => {
    const userAccess = await RoleService.getUserAccessList(user);
    const isMain = user.permission === 'admin' || userAccess.includes('shot-main-score');

    let sectionKeys = [];
    if (isMain) {
        sectionKeys = [...ShotScoreEntity.getAllSectionKeys(), 'shot-main-score'];
    } else {
        if (userAccess.includes('shot-list-score')) sectionKeys.push('shot-list-score');
        if (userAccess.includes('shot-equalize-score')) sectionKeys.push('shot-equalize-score');
        if (userAccess.includes('shot-editing-score')) sectionKeys.push('shot-editing-score');
    }

    return { userSections: sectionKeys, isMain };
};

const getScoresBySection = async ({ shotId, section = 'shot-main-score' }) => {
    return ShotScore.findAll({ where: { section, shotId } });
};

const getAvailableScoreItems = async (user) => {
    const { userSections, isMain } = await getUserScoreSections(user);
    const allScores = ShotScoreEntity.getShotScoreList();

    if (isMain) {
        return allScores.map(score => ({ ...score, isMain }));
    }

    return allScores.filter(score => userSections.includes(score.sectionKey));
};

const listScoresForShot = async (user, shotId) => {
    const { userSections, isMain } = await getUserScoreSections(user);
    const query = {
        where: {
            shotId,
            section: userSections,
        },
        include: [{ model: User, as: 'user' }],
    };

    if (!isMain) {
        query.where.userId = user.id;
    }

    return ShotScore.findAll(query);
};

const storeMainScores = async ({ user, shotId, scores }) => {
    const userId = user.id;
    const section = 'shot-main-score';

    for (const score of scores) {
        await ShotScore.upsert(
            { shotId, userId, scoreKey: score.key, score: score.score, section },
            { where: { shotId, scoreKey: score.key, section } }
        );
    }
};

const storeSectionalScores = async ({ user, shotId, scores }) => {
    const userId = user.id;

    for (const score of scores) {
        await ShotScore.upsert(
            { shotId, userId, scoreKey: score.key, score: score.score, section: score.section },
            { where: { shotId, userId, scoreKey: score.key, section: score.section } }
        );
    }
};

const saveShotScores = async ({ user, shotId, scores }) => {
    const { isMain } = await getUserScoreSections(user);
    if (isMain) {
        await storeMainScores({ user, shotId, scores });
    } else {
        await storeSectionalScores({ user, shotId, scores });
    }
};

module.exports = {
    getUserScoreSections,
    getScoresBySection,
    getAvailableScoreItems,
    listScoresForShot,
    saveShotScores,
};