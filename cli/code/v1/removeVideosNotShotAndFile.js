const path = require("path")
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));

const DBConnection = require("../../../db/DBConnection");

const { VideoFile } = require("../../../modules/_default/model");
const { shotService } = require("../../../modules/services/shotList");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const videoFiles = await VideoFile.findAll({ where: { name: "nothing", path: "nothing" } });
        for (let i = 0; i < videoFiles.length; i++) {
            const { count } = await shotService.shotList({ videoFileId: videoFiles[i].id });
            if (count === 0 && videoFiles[i].name === "nothing" && videoFiles[i].path === "nothing") {
                await videoFiles[i].destroy();
            }
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()