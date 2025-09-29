const fs = require("fs");
const path = require("path");

class ShotScore_Entity {
    constructor() {
        this.shotScore = [];
    }

    getShotScoreList() {
        return this.shotScore
    }

    getAllSectionKeys() {
        return [...new Set(this.shotScore.map(x => x.sectionKey))]
    }

    getAllKeys() {
        return [...new Set(this.shotScore.map(x => x.key))]
    }

    getAllTitles() {
        return [...new Set(this.shotScore.map(x => x.title))]
    }

    getByKey(key) {
        return this.shotScore.find(x => x.key == key)
    }

    getByKeyAndSection(section, key) {
        return this.shotScore.find(x => x.key == key && x.sectionKey == section)
    }

    checkKeysAreValid(keys = []) {
        let response = []

        for (const key of keys) {
            const isExists = this.shotScore.find(x => x.key == key)
            response.push(isExists)
        }


        return !response.includes(false)

    }

    getByKeys(keys = []) {
        let response = []
        for (const score of this.shotScore) {
            if (keys.includes(score.key)) {
                response.push(score)
            }
        }

        return response
    }

    getByKeysAndSections(keys = [], section = []) {
        let response = []
        for (const score of this.shotScore) {
            const isExist = score.sectionKey.some(sec => section.includes(sec))
            if (isExist && keys.includes(score.key)) {
                response.push(score.key)
            }
        }

        return response
    }

    getBySections(sections = []) {

        let scores = []
        for (const score of this.shotScore) {

            const isExist = score.sectionKey.some(sec => sections.includes(sec))
            if (isExist) {
                scores.push(score)
            }

        }

        return scores
    }

    readAccessFromFile() {
        let content = fs.readFileSync(
            path.join(__dirname, "shotScores.json")
        );
        content = JSON.parse(content.toString());
        this.shotScore = content;
    }

    static getInstance() {
        if (!this.instance) {
            const entity = new ShotScore_Entity();
            entity.readAccessFromFile();
            this.instance = entity;
            console.log(`[+] shot score cached`);
        }
        return this.instance;
    }

}

module.exports = ShotScore_Entity.getInstance();