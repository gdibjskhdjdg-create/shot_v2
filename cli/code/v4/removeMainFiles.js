const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { VideoFile } = require("../../../modules/_default/model");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const projectIds = [199, 200, 201, 202, 203, 211];
        let fileCount = 0;
        for (let j = 0; j < projectIds.length; j++) {
            const projectId = projectIds[j];
            console.log(projectId)
            const videos = await VideoFile.findAll({ where: { projectId } });

            for (let i = 0; i < videos.length; i++) {
                const item = videos[i];
                let code = item.name.split(".")[0].split("_")[1];
                const fileName = `${code}.${item.format}`
                const pathToFile = path.join(item.path, fileName);
                console.log(fs.existsSync(pathToFile), fileName !== item.name, projectId)
                if (fs.existsSync(pathToFile) && fileName !== item.name) {
                        console.log(pathToFile)
                    const state = fs.statSync(pathToFile);
                    fs.unlinkSync(pathToFile);
                    fileCount++;
                }
            }
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
