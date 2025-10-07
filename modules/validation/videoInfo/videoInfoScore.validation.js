const Validation = require("../../_default/validation");
const VideoInfoScoreEntity = require("../../entity/videoInfo/VideoInfoScore.entity");


class VideoInfoScoreValidation extends Validation {

    async store(isMain, scores = []) {
        this.setEmpty()

        const scoreKeys = scores.map(x => x.key)

        if (isMain) {
            
            if (!VideoInfoScoreEntity.checkKeysAreValid(scoreKeys)) {
                this.setError("score keys is invalid")
            }

        } else {
            const validScores = []
            for (const score of scores) {
                const getScore = VideoInfoScoreEntity.getByKeyAndSection(score.section, score.key)
                if (getScore) {
                    validScores.push(score)
                }
            }

            if (validScores.length != scoreKeys.length) {
                this.setError("score keys is invalid")
            }

        }

        this.setValidData('scores', scores)

        return this.getResult()
    }
}

module.exports = new VideoInfoScoreValidation();