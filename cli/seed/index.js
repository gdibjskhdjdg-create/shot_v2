require("../../configs");
require("app-module-path").addPath(__dirname);

const fs = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');

const findSeederFiles = async () => {
    let seederFile = [];

    const modulePath = path.join(__dirname, '..', '..', 'modules', 'seeders');
    const moduleFolders = await readdir(modulePath);

    for (let i = 0; i < moduleFolders.length; i++) {
        const folderPath = path.join(modulePath, moduleFolders[i]);
        if (fs.existsSync(folderPath)) {
            let migrateFiles = await readdir(folderPath);
            migrateFiles = migrateFiles.map(item => ({
                name: item,
                fullPath: path.join(folderPath, item),
                path: path.join("modules", 'seeders', moduleFolders[i], item)
            }));

            seederFile = [...seederFile, ...migrateFiles]
        }
    }

    return seederFile.sort((a, b) => parseInt(a.name) - parseInt(b.name));
}

(async () => {
    let seederFiles = await findSeederFiles();
    for (let i = 0; i < seederFiles.length; i++) {
        console.log(seederFiles[i].fullPath)
        await require(seederFiles[i].fullPath).up();
    }

    process.exit(0)
})()