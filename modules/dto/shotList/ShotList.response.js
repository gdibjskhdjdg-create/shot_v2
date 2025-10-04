const GalleryParser = require("../../../helper/galleryParser.tool");
const TypeTool = require("../../../helper/type.tool");
const BaseResponse = require("../../_default/BaseResponse");
const { videoFileService } = require("../../services/videoFile");


class ShotListResponse extends BaseResponse {

    constructor(data) {
        super(data);

        const tagsId = data.tagIds[0]?.toJSON()
        const videoFile = data.videoFile?.toJSON()

        this.id = this.setValue(["id"], 'number');
        this.videoFileId = this.setValue(["videoFileId"], 'number');
        this.title = this.setValue(["title"], 'string');
        this.startTime = this.setValue(["startTime"], 'string');
        this.endTime = this.setValue(["endTime"], 'string');
        this.category = data?.category?.map(item => ({ id: item.id, name: item.name }));
        this.pictureDescription = this.setValue(["pictureDescription"], 'string');
        this.updatedAt = this.setValue(["updatedAt"], 'date');
        this.createdAt = this.setValue(["createdAt"], 'date');
        this.status = data.status;
        this.user = data.user;
        this.project = data.project;
        this.export = data?.export
        this.inVideo = TypeTool.boolean(tagsId?.inVideo)
        this.videoFileUrl = videoFileService.getVideoFileURL(this.videoFileId);
        this.videoFileName = videoFile?.originalName
        this.videoFilePath = videoFile?.originalPath  
        this.gallery = GalleryParser(data.gallery);
    }}

module.exports = ShotListResponse;