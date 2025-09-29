const Validation = require("../../_default/validation");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");


class ShotScoreValidation extends Validation {

    async store(isMain, scores = []) {
        this.setEmpty()

        const scoreKeys = scores.map(x => x.key)

        if (isMain) {
            
            if (!ShotScoreEntity.checkKeysAreValid(scoreKeys)) {
                this.setError("score Keys are Invalid")
            }

        } else {
            const validScores = []
            for (const score of scores) {
                const getScore = ShotScoreEntity.getByKeyAndSection(score.section, score.key)
                if (getScore) {
                    validScores.push(score)
                }
            }

            if (validScores.length != scoreKeys.length) {
                this.setError("score Keys are Invalid")
            }

        }

        this.setValidData('scores', scores)

        return this.getResult()
    }
}

module.exports = new ShotScoreValidation();