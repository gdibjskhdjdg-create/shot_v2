const fs = require("fs")
const path = require("path")
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Shot, City, Tag, ShotRelTag, ShotInput } = require("../../../modules/_default/model");
const TagService = require("../../../modules/services/tag/Tag.service");
const ShotDefaultValueService = require("../../../modules/services/shotList/ShotDefaultValue.service");

(async () => {
    try{
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();
    
        const shotWithCityId = await Shot.findAll({ where: { cityId: { [Op.not]: null }}, attributes: ["id", "cityId"] });
        const cities = await City.findAll({where: {id: [...new Set(shotWithCityId.map(item => item.cityId ))]}, attributes: ["id", "name"]});
        const cityTag = {};
        for(let i = 0; i < cities.length; i++){
            let checkTag = await Tag.findOne({ where : { tag: cities[i].name }})
            if(!checkTag){
                checkTag = await TagService.createTag({
                    tag: cities[i].name,
                    type: "location",
                })
            }

            cityTag[cities[i].id] = checkTag.id;
        }

        let newCreated = 0;
        const shotInput = await ShotInput.findOne({ where: {title: "مکان فیلم", valuesFrom: "tag"}})
        for(let i = 0; i < shotWithCityId.length; i++){
            let checkExist = await ShotRelTag.findOne({ 
                where: { 
                    shotId: shotWithCityId[i].id, 
                    tagId: cityTag[shotWithCityId[i].cityId], 
                    inputId: shotInput.id, 
                    inVideo: 0 
                }})
            if(!checkExist){
                newCreated++;
                await ShotRelTag.create({ 
                    shotId: shotWithCityId[i].id, 
                    tagId: cityTag[shotWithCityId[i].cityId], 
                    inputId: shotInput.id, 
                    inVideo: 0 
                })
            }
        }

    }
    catch(err){
        console.log(err)
    }

    process.exit();
})()