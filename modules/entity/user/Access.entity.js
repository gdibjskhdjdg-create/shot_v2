const fs = require("fs");
const path = require("path");

class Access_Entity {
    constructor() {
        this.access = [];
    }

    isValidKey(key) {
        let find = false;
        for (let i = 0; i < this.access.length; i++) {
            const access = this.access[i];
            if (access.access.find((item) => item.key === key)) {
                find = true;
                break;
            }
        }

        return find;
    }

    getAccessList() {
        return this.access;
    }

    getAllAccessKeys() {
        let result = []
        this.access.map(section => {
            result = [...result, ...section.access.map(x => x.key)]
        })
        return result
    }

    readAccessFromFile() {
        let content = fs.readFileSync(
            path.join(__dirname, "access.json")
        );
        content = JSON.parse(content.toString());
        this.access = content;
    }

    static getInstance() {
        if (!this.instance) {
            const entity = new Access_Entity();
            entity.readAccessFromFile();
            this.instance = entity;
            console.log(`[+] access cached`);
        }
        return this.instance;
    }
}

module.exports = Access_Entity.getInstance();