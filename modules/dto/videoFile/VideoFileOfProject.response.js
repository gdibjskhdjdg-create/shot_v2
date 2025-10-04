const path = require("path");
const VideoFileResponse = require("./VideoFile.response");

class VideoFileOfProjectResponse extends VideoFileResponse {

    constructor(data){
        super(data);

        this.originalPath = this.setValue(["originalPath"], 'string');
        this.sepOriginalPath = data?.originalPath?.split(path.sep);
    }
}

module.exports = VideoFileOfProjectResponse;