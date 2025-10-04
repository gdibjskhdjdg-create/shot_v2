const VideoFileResponse = require("./VideoFile.response");

class VideoFileFullResponse extends VideoFileResponse {

    constructor(data){
        super(data);

        this.fullInfo = this.setValue(["fullInfo"], 'string');
    }
}

module.exports = VideoFileFullResponse;