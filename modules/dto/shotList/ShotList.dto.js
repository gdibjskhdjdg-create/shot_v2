const GalleryParser = require("../../../helper/galleryParser.tool");
const TypeTool = require("../../../helper/type.tool");
const DTO = require("../../_default/DTO");
const { videoFileService } = require("../../services/videoFile");


class ShotList_DTO extends DTO {

    constructor(data) {
        super(data);

        const tagsId = data.tagIds[0]?.toJSON()
        const videoFile = data.videoFile?.toJSON()

        this.id = this.validate(["id"], 'number');
        this.videoFileId = this.validate(["videoFileId"], 'number');
        this.title = this.validate(["title"], 'string');
        this.startTime = this.validate(["startTime"], 'string');
        this.endTime = this.validate(["endTime"], 'string');
        this.category = data?.category?.map(item => ({ id: item.id, name: item.name }));
        this.pictureDescription = this.validate(["pictureDescription"], 'string');
        this.updatedAt = this.validate(["updatedAt"], 'date');
        this.createdAt = this.validate(["createdAt"], 'date');
        this.status = data.status;
        this.user = data.user;
        this.project = data.project;
        this.export = data?.export
        this.inVideo = TypeTool.boolean(tagsId?.inVideo)
        this.videoFileUrl = videoFileService.getVideoFileURL(this.videoFileId);
        this.videoFileName = videoFile?.originalName
        this.videoFilePath = videoFile?.originalPath

        this.gallery = GalleryParser(data.gallery);
    }
}

module.exports = ShotList_DTO