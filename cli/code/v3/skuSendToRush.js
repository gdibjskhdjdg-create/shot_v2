const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { ExportVideoFile } = require("../../../modules/_default/model");
const RashGateway = require("../../../gateway/Rash.gateway");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        console.log('start send sku products to rush ')
        const files = await ExportVideoFile.findAll({
            where: {
                productId: { [Op.not]: null }
            },
            order: [['id', 'DESC']],
        });

let i = 1;
        for (const file of files) {
            await RashGateway.updateProductFiles(file.productId, { sku: file.code })
                .then(async (response) => {

                }).catch(async error => {

                })
console.log(i, files.length,file.productId);
i++;
        }

        console.log(' send sku products to rush is complete ')
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
