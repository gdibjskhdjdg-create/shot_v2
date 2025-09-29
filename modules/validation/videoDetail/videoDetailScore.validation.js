const Validation = require("../../_default/validation");
const VideoDetailEntity = require("../../entity/videoDetail/VideoDetail.entity");


class VideoDetailScoreValidation extends Validation {

    async store(isMain, scores = []) {
        this.setEmpty()

        const scoreKeys = scores.map(x => x.key)

        if (isMain) {
            
            if (!VideoDetailEntity.checkKeysAreValid(scoreKeys)) {
                this.setError("score keys is invalid")
            }

        } else {
            const validScores = []
            for (const score of scores) {
                const getScore = VideoDetailEntity.getByKeyAndSection(score.section, score.key)
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

module.exports = new VideoDetailScoreValidation();