const fs = require("fs");
const path = require("path");

class VideoInfoScore_Entity {
    constructor() {
        this.videoInfoScore = [];
    }

    getVideoInfoScoreList() {
        return this.videoInfoScore
    }

    getAllSectionKeys() {
        return [...new Set(this.videoInfoScore.map(x => x.sectionKey))]
    }

    getAllKeys() {
        return [...new Set(this.videoInfoScore.map(x => x.key))]
    }

    getAllTitles() {
        return [...new Set(this.videoInfoScore.map(x => x.title))]
    }

    getByKey(key) {
        return this.videoInfoScore.find(x => x.key == key)
    }

    getByKeyAndSection(section, key) {
        return this.videoInfoScore.find(x => x.key == key && x.sectionKey == section)
    }

    checkKeysAreValid(keys = []) {
        let response = []

        for (const key of keys) {
            const isExists = this.videoInfoScore.find(x => x.key == key)
            response.push(isExists)
        }

        return !response.includes(false)
    }

    getByKeys(keys = []) {
        let response = []
        for (const score of this.videoInfoScore) {
            if (keys.includes(score.key)) {
                response.push(score)
            }
        }

        return response
    }

    getByKeysAndSections(keys = [], section = []) {
        let response = []
        for (const score of this.videoInfoScore) {
            const isExist = score.sectionKey.some(sec => section.includes(sec))
            if (isExist && keys.includes(score.key)) {
                response.push(score.key)
            }
        }

        return response
    }

    getBySections(sections = []) {
        let scores = []
        for (const score of this.videoInfoScore) {
            const isExist = score.sectionKey.some(sec => sections.includes(sec))
            if (isExist) {
                scores.push(score)
            }
        }

        return scores
    }

    readAccessFromFile() {

        let content = fs.readFileSync(

            path.join(__dirname, "..", "shotList", "shotScores.json"),
            {encoding: 'utf-8'}
        );

        content = JSON.parse(content.toString());
        this.videoInfoScore = content;
    }

    static getInstance() {
        if (!this.instance) {
            const entity = new VideoInfoScore_Entity();
            entity.readAccessFromFile();
            this.instance = entity;
            console.log(`[+] shot info score cached`);
        }
        return this.instance;
    }

}

module.exports = VideoInfoScore_Entity.getInstance();