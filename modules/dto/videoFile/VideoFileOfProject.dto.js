const path = require("path");
const VideoFile_DTO = require("./VideoFile.dto");

class VideoFileOfProject_DTO extends VideoFile_DTO {

    constructor(data){
        super(data);

        this.originalPath = this.validate(["originalPath"], 'string');
        this.sepOriginalPath = data?.originalPath?.split(path.sep);
    }
}

module.exports = VideoFileOfProject_DTO;