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
        console.log('main file movement')
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const take = 100;
        let biggestId = 0;

        if(!appConfigs.MainFile_FOLDER_FROM_APP_ROOT){
            console.log("ERROR: appConfigs.MainFile_FOLDER_FROM_APP_ROOT")
            process.exit();
        }
	console.log("start")

	let count = 0;
        const pathToStoreFile = path.join(__dirname, '..', '..', '..', appConfigs.MainFile_FOLDER_FROM_APP_ROOT);
        while (true) {
            const files = await VideoFile.findAll({
                where: {
                    //id: 1
                     id: { [Op.gt]: biggestId }
                },
                limit: +take,
                attributes: ['id', 'name', 'format', 'status', 'projectId', 'path', 'originalPath']
            });

            if (files.length === 0) {
                break;
            }

            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                biggestId = file.id;
                const { 
                    name, 
                    path: filePath, 
                    projectId, 
                    originalPath,
                    format
                } = file.toJSON();

                let converted = name.includes("convert_");
                let nameWithoutConvert = name.replace("convert_", "");

                const code = nameWithoutConvert.split(".")[0];
                const fileName = `${code}.${format}`
                const mainFilePath = path.join(filePath, fileName);

                //console.log(files[i].id, mainFilePath);
                if (!fs.existsSync(mainFilePath)) {
                    continue;
                }

                const targetDirMainPath = path.join(`${pathToStoreFile}`, "not_transcode_files", `${projectId}`, `${originalPath}`);
                if (!fs.existsSync(targetDirMainPath)) {
                    fs.mkdirSync(targetDirMainPath, { recursive: true })
                }
                const targetMainFilePath = path.join(targetDirMainPath, fileName)

		console.log(file.id)
		if(mainFilePath === targetMainFilePath) continue;

		count++;
		console.log(count, files[i].id, converted, projectId, mainFilePath, targetDirMainPath);
		fs.renameSync(mainFilePath, targetMainFilePath)

                // 0 = encode queue
                 if (!converted) {
			console.log("Update DB: " + file.id)
                     file.path = targetDirMainPath
                     await file.save()
                 }
            }

//            break;
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
