const fs = require("fs")
const path = require("path")
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Project } = require("../../../modules/_default/model");
const { projectService } = require("../../../modules/services/project");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        // Define pagination parameters
        let pageIndex = 0; // Current page number
        const pageSize = 200; // Records per page
        let countUpdated = 0

        while (1) {
            const data = await Project.findAndCountAll({
                where: {
                    shotStatus: null,
                },
                limit: pageSize,
                offset: pageIndex * pageSize, // Calculate offset
            })

            const rows = data.rows
            const total = data.count

            countUpdated += rows.length

            if (rows.length == 0) {
                break
            }


            for (const myProject of rows) {
                await projectService.updateProjectStatus(myProject.id)
            }

            console.log(111111111, 'shotStatus fields ', `${countUpdated} of ${total} is updated`)

            pageIndex++
        }

    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()