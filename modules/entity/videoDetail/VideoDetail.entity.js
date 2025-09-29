const fs = require("fs");
const path = require("path");

class VideoDetailScore_Entity {
    constructor() {
        this.videoDetailScore = [];
    }

    getVideoDetailScoreList() {
        return this.videoDetailScore
    }

    getAllSectionKeys() {
        return [...new Set(this.videoDetailScore.map(x => x.sectionKey))]
    }

    getAllKeys() {
        return [...new Set(this.videoDetailScore.map(x => x.key))]
    }

    getAllTitles() {
        return [...new Set(this.videoDetailScore.map(x => x.title))]
    }

    getByKey(key) {
        return this.videoDetailScore.find(x => x.key == key)
    }

    getByKeyAndSection(section, key) {
        return this.videoDetailScore.find(x => x.key == key && x.sectionKey == section)
    }

    checkKeysAreValid(keys = []) {
        let response = []

        for (const key of keys) {
            const isExists = this.videoDetailScore.find(x => x.key == key)
            response.push(isExists)
        }

        return !response.includes(false)
    }

    getByKeys(keys = []) {
        let response = []
        for (const score of this.videoDetailScore) {
            if (keys.includes(score.key)) {
                response.push(score)
            }
        }

        return response
    }

    getByKeysAndSections(keys = [], section = []) {
        let response = []
        for (const score of this.videoDetailScore) {
            const isExist = score.sectionKey.some(sec => section.includes(sec))
            if (isExist && keys.includes(score.key)) {
                response.push(score.key)
            }
        }

        return response
    }

    getBySections(sections = []) {
        let scores = []
        for (const score of this.videoDetailScore) {
            const isExist = score.sectionKey.some(sec => sections.includes(sec))
            if (isExist) {
                scores.push(score)
            }
        }

        return scores
    }

    readAccessFromFile() {

        let content = fs.readFileSync(

            path.join(__dirname, "..", "..", "entity", "shotList", "shotScores.json")
        );
        content = JSON.parse(content.toString());
        this.videoDetailScore = content;
    }

    static getInstance() {
        if (!this.instance) {
            const entity = new VideoDetailScore_Entity();
            entity.readAccessFromFile();
            this.instance = entity;
            console.log(`[+] shot score cached`);
        }
        return this.instance;
    }

}

module.exports = VideoDetailScore_Entity.getInstance();