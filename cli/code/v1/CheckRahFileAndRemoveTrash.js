const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { ExportVideoFile } = require("../../../modules/_default/model");
const RashGateway = require("../../../gateway/Rash.gateway");
const { exportVideoService } = require("../../../modules/services/videoFile");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        let removeFile = 0;
        const take = 100;
        let biggestId = 0;

        while(true){
            const files = await ExportVideoFile.findAll({
                where: {
                    id: { [Op.gt]: biggestId},
                    productId: { [Op.not]: null }
                },
                limit: +take,
            });

            if(files.length === 0){
                break;
            }

            for(let i = 0; i < files.length; i++){
                biggestId = files[i].id;
                const status = await RashGateway.getProductStatus(files[i].productId);
                if(status.productStatus === "trash"){
                    await exportVideoService.deleteFile(files[i].id) 
                    removeFile++;
                    console.log("Remove: " + files[i].id)
                }
            }
        }

    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
