const Validation = require("../../_default/validation");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");

const validateShotScores = async (isMain, scores = []) => {
    const validation = new Validation();
    const scoreKeys = scores.map(x => x.key);

    if (isMain) {
        if (!ShotScoreEntity.checkKeysAreValid(scoreKeys)) {
            validation.setError("score Keys are Invalid");
        }
    } else {
        const validScores = scores.filter(score => 
            ShotScoreEntity.getByKeyAndSection(score.section, score.key)
        );

        if (validScores.length !== scores.length) {
            validation.setError("score Keys are Invalid");
        }
    }

    if (!validation.isError) {
        validation.setValidData('scores', scores);
    }

    return validation.getResult();
};

module.exports = {
    store: validateShotScores,
};