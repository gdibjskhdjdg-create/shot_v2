const VideoFile_DTO = require("./VideoFile.dto");

class VideoFileFull_DTO extends VideoFile_DTO {

    constructor(data){
        super(data);

        this.fullInfo = this.validate(["fullInfo"], 'string');
    }
}

module.exports = VideoFileFull_DTO;