const BaseResponse = require("../../_default/BaseResponse");
const ShotScoreEntity = require("../../entity/shotList/ShotScore.entity");


class ShotScoreResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const findScore = ShotScoreEntity.getByKey(data.scoreKey)

        this.shotId = this.setValue(["shotId", 'number']);
        this.userId = data?.user?.id
        this.userFullName = data?.user?.fullName
        this.score = this.setValue(["score", 'string']);
        this.section = this.setValue(["section", 'string']);
        this.sectionTitle = data.section == 'shot-main-score' ? findScore.sectionTitle : 'main';
        this.scoreKey = this.setValue(["scoreKey", 'string']);
        this.scoreTitle = findScore.title
        this.scoreDescription = findScore.description
    }}

module.exports = ShotScoreResponse;