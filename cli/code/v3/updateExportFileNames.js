const fs = require('fs');
const path = require('path');
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));

(() => {
    const pathToExport = path.join(__dirname, "..", "..", '..', process.env.STORE_FOLDER_FROM_APP_ROOT, "exportFileLocation");
    console.log(pathToExport)
    fs.readdir(pathToExport, function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const pathToFolder = path.join(pathToExport, file);
            const oldFile = path.join(pathToFolder, "concat.mp4");
            if (fs.lstatSync(pathToFolder).isDirectory() && fs.existsSync(oldFile)) {
                const newFile = path.join(pathToFolder, `${file}_pure.mp4`)
                fs.rename(oldFile, newFile, (err) => {
                    if (err) {
                        console.log(err)
                    }
                });
            }

            console.log(i, files.length, pathToFolder)
        }
    });
})()
