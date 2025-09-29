const DTO = require("../../_default/DTO");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");


class ShotScore_DTO extends DTO {

    constructor(data) {
        super(data);

        const findScore = ShotScoreEntity.getByKey(data.scoreKey)

        this.shotId = this.validate(["shotId", 'number']);
        this.userId = data?.user?.id
        this.userFullName = data?.user?.fullName
        this.score = this.validate(["score", 'string']);
        this.section = this.validate(["section", 'string']);
        this.sectionTitle = data.section == 'shot-main-score' ? findScore.sectionTitle : 'main';
        this.scoreKey = this.validate(["scoreKey", 'string']);
        this.scoreTitle = findScore.title
        this.scoreDescription = findScore.description
    }
}

module.exports = ShotScore_DTO