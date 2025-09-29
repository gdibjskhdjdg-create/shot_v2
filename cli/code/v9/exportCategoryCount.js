const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes

const { Category, sequelize, Project } = require("../../../modules/_default/model");
const { default: writeXlsxFile } = require("write-excel-file/node");


(async () => {
    try {
        console.log('[+] Video export ai excel')
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const categories = (await Category.findAll({}))?.map(x => x.toJSON()) || [];
        const projects = (await Project.findAll({}))?.map(x => x.toJSON()).map(item => ({id: item.id, title: item.title})) || [];

        let projectItems = []
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i]

            const query = "SELECT c.id AS category_id, c.name AS category_name, COUNT(v.videoFileId) AS video_count FROM categories c LEFT JOIN video_detail_category vc ON c.id = vc.categoryId LEFT JOIN video_detail v ON vc.videoFileId = v.videoFileId AND v.projectId = :projectId GROUP BY c.id, c.name HAVING video_count > 0 ORDER BY video_count DESC;"
            let videosOfCategory = (await sequelize.query(query, { replacements: { projectId: project.id }, type: QueryTypes.SELECT }));
            categories.forEach(it => {
                const isExist = videosOfCategory.find(i => i.category_id == it.id);
                if(!isExist){
                    videosOfCategory.push({ category_id: it.id, category_name: it.name, video_count: 0 })
                }
            });

            const c = {};
            videosOfCategory.sort((a, b) => a.category_id - b.category_id).forEach(it => {
                c[it.category_id] = it.video_count
            })
            projectItems.push({id: project.id, title: project.title, categories: c})

            console.log("Project complete: " + project.id);
            console.log("Remaining: " + i + " - " + projects.length)
        }

        const schema = [
            { column: "", value: item => item.title },
            ...categories.map(it => ({ column: it.name, value: item => item.categories[it.id.toString()] })),
        ]


        await writeXlsxFile(
            [projectItems],
            {
                schema: [schema],
                sheets: ["all"],
                filePath: path.join(__dirname, "project_category.xlsx")
            }
        )
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
