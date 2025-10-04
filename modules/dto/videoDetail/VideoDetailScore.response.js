const BaseResponse = require("../../_default/BaseResponse");
const VideoDetailEntity = require("../../entity/videoDetail/VideoDetail.entity");


class VideoDetailScoreResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const findScore = VideoDetailEntity.getByKey(data.scoreKey);

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

module.exports = VideoDetailScoreResponse