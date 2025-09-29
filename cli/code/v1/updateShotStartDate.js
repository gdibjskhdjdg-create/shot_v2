const fs = require("fs")
const path = require("path")
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));

const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const { shotService } = require("../../../modules/services/shotList/index");
const Op = Sequelize.Op;

const TypeTool = require("../../../helper/type.tool");


(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        // Define pagination parameters
        let pageIndex = 0; // Current page number
        const pageSize = 200; // Records per page
        let countUpdated = 0

        while (1) {
            const data = await shotService.shotList({
                startDate: { [Op.not]: null },
                take: pageSize,
                page: (pageIndex + 1), // Calculate offset
            })

            const rows = data.shots
            const total = data.count

            countUpdated += rows.length

            if (rows.length == 0) {
                break
            }

            for (const myShot of rows) {
                const { startDate, endDate } = myShot
                const isValidStartDate = TypeTool.isValidJalaliDate(startDate)
                const isValidEndDate = TypeTool.isValidJalaliDate(endDate)

                if (isValidStartDate) {
                    myShot.startDate = TypeTool.jalaliDateToTimestamp(startDate)
                }

                if (isValidEndDate) {
                    myShot.endDate = TypeTool.jalaliDateToTimestamp(endDate)
                }

                await myShot.save()


            }

            console.log(111111111, 'convert startDate and endDate fields to timestamp: ', `${countUpdated} of ${total} is updated`)

            pageIndex++
        }


    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()