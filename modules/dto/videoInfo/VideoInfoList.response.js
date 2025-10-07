const GalleryParser = require("../../../helper/galleryParser.tool");
const TypeTool = require("../../../helper/type.tool");
const BaseResponse = require("../../_default/BaseResponse");
const { videoFileService } = require("../../services/videoFile");
const { findVideoInfoStatusByValue, findVideoInfoShotStatusByValue } = require("../../models/videoDetail/enum/VideoInfo.enum");


class VideoInfoListResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const tagsId = data.tagIds?.[0]?.toJSON()
        const videoFile = data.videoFile?.toJSON()

        // this.isAI = data.isAI
        this.aiTagStatus = this.setValue(["aiTagStatus"], 'string');
        this.videoFileId = this.setValue(["videoFileId"], 'number');
        this.title = this.setValue(["title"], 'string');
        this.startTime = this.setValue(["startTime"], 'string');
        this.endTime = this.setValue(["endTime"], 'string');
        this.category = data?.category?.map(item => ({ id: item.id, name: item.name }));
        this.pictureDescription = this.setValue(["pictureDescription"], 'string');
        this.updatedAt = this.setValue(["updatedAt"], 'date');
        this.createdAt = this.setValue(["createdAt"], 'date');
        this.user = data.user;
        this.project = data.project;
        this.inVideo = TypeTool.boolean(tagsId?.inVideo)
        this.videoFileUrl = videoFileService.getVideoFileURL(this.videoFileId);
        this.videoFileName = videoFile?.originalName
        this.videoFilePath = videoFile?.originalPath
        this.cleaningDescription = this.setValue(["cleaningDescription"], 'string');

        this.status = findVideoInfoStatusByValue(data.status);
        this.shotStatus = findVideoInfoShotStatusByValue(data.shotStatus);

        this.gallery = GalleryParser(data.gallery);
    }
}

module.exports = VideoInfoListResponse;