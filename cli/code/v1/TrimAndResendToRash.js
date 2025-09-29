const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { ExportVideoFile } = require("../../../modules/_default/model");
const { videoEditorService, exportVideoService, rashService } = require("../../../modules/services/videoFile");
const RashGateway = require("../../../gateway/Rash.gateway");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const take = 1;
        let page = 1;
        let removeFile = 1;

        while (true) {
            const files = await ExportVideoFile.findAll({
                where: {
                    productId: { [Op.not]: null }
                },
                include: 'detail',
                limit: +take,
                offset: (+page - 1) * +take,
                //order: [['endTime', 'DESC'], ['id', 'DESC']],
            });

            if (files.length === 0) {
                break;
            }

            const file = files[0];

            const status = await RashGateway.getProductStatus(file.productId);
            console.log(5555555, file.id, status.productStatus);
            if (status.productStatus === "trash") {
                await exportVideoService.deleteFile(file.id);
                removeFile++;
                console.log("Remove: " + file.id);
                continue;
            }

            page++;
            await videoEditorService.init(file);
            console.log("New file complete!")
            await rashService.updateProductFiles(file);
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
