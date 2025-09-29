const DTO = require("../../_default/DTO");
const VideoDetailEntity = require("../../entity/videoDetail/VideoDetail.entity");


class VideoDetailScore_DTO extends DTO {

    constructor(data) {
        super(data);

        const findScore = VideoDetailEntity.getByKey(data.scoreKey);

        this.videoFileId = this.validate(["videoFileId", 'number']);
        this.userId = data?.user?.id
        this.userFullName = data?.user?.fullName
        this.score = this.validate(["score", 'string']);
        this.section = this.validate(["section", 'string']);
        this.sectionTitle = data.section == 'shot-main-score' ? findScore?.sectionTitle : 'main';
        this.scoreKey = this.validate(["scoreKey", 'string']);
        this.scoreTitle = findScore?.title
        this.scoreDescription = findScore?.description
    }
}

module.exports = VideoDetailScore_DTO