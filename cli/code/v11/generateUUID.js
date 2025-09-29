// UPDATE `video_files` SET `fullInfo`= null WHERE status = 5 OR status = 3;
const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const { v4: uuidv4 } = require('uuid');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { 
    Language,
    Category,
    Owner,
    Tag,
    VideoFile,
    Project,
    Shot,
} = require("../../../modules/_default/model");

(async () => {
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping();

    await StoreUUID(Category);
    await StoreUUID(Language);
    await StoreUUID(Owner);
    await StoreUUID(Tag);
    await StoreUUID(Project);
    await StoreUUID(Shot);
    await StoreUUID(VideoFile);

    process.exit();
})();


async function StoreUUID(model) {
    const values = await model.findAll({
        where: { [Op.or]: [{UUID: ""} , {UUID: null}] },
        attributes: ["id", "UUID"]
    });

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