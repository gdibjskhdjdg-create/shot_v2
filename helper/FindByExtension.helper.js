const fs = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');


const FindByExtension = async (dir, ext) => {
    let matchedFiles = [];

    const files = await readdir(dir);
    for (const file of files) {
        let newDir = path.join(dir, file);
        if(fs.existsSync(newDir) && fs.lstatSync(newDir).isDirectory()){
            let newFiles = await FindByExtension(newDir, ext);
            matchedFiles = matchedFiles.concat(newFiles)
        }
        else{
            if (file.includes(ext)) {
                matchedFiles.push(path.join(dir, file));
            }
        }
    }

    return matchedFiles;

}

module.exports = FindByExtension;