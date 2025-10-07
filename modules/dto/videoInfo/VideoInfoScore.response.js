const BaseResponse = require("../../_default/BaseResponse");
const VideoInfoScoreEntity = require("../../entity/videoInfo/VideoInfoScore.entity");


class VideoInfoScoreResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const findScore = VideoInfoScoreEntity.getByKey(data.scoreKey);

        this.videoFileId = this.setValue(["videoFileId", 'number']);
        this.userId = data?.user?.id
        this.userFullName = data?.user?.fullName
        this.score = this.setValue(["score", 'string']);
        this.section = this.setValue(["section", 'string']);
        this.sectionTitle = data.section == 'shot-main-score' ? findScore?.sectionTitle : 'main';
        this.scoreKey = this.setValue(["scoreKey", 'string']);
        this.scoreTitle = findScore?.title
        this.scoreDescription = findScore?.description
    }
}

module.exports = VideoInfoScoreResponse