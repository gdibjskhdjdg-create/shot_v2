const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const { v4: uuidv4 } = require('uuid');

const { Tag } = require("../../../modules/_default/model");
const TagService = require("../../../modules/services/tag/Tag.service");

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping();
    
    const tags = await Tag.findAll({
        where: { count: 0 },
        attributes: [ "id" ]
    });

    const startTime = Date.now()
    const totalCount = tags.length
    for(let i = 0; i < totalCount; i++){
        console.log(`${i} : ${totalCount}`);
        await TagService.updateTagCount([tags[i].id])
    }
    const endTime = Date.now();
    console.log("Finished: ", endTime - startTime)

    process.exit();
})();


async function StoreUUID(model) {


    console.log(`Start insert UUID ${model.name}: ` + values.length);

    for(let i = 0; i < values.length; i++){
        values[i].UUID = uuidv4();
        await values[i].save();

        if(i%100 === 0){
            console.log(`${i} : ${values.length}`)
        }
    }

    console.log(`Complete insert UUID ${model.name}: ` + values.length);
}