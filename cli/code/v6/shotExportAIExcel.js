const path = require("path");
const fs = require("fs");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const QueryTypes = Sequelize.QueryTypes

const { Category, ShotRelCategory, sequelize, ShotInput } = require("../../../modules/_default/model");
const { default: writeXlsxFile } = require("write-excel-file/node");
const { generateRandomCode } = require("../../../helper/general.tool");
const { title } = require("process");


// SELECT t.id as tag_id , t.tag as tag_title, sti.sid as input_id , sti.si_title as input_title, scount as shot_count FROM `tags` t left join (select st.tagId as s_tagId, si.title as si_title , si.id as sid, COUNT(st.`shotId`) as scount from `shot_tag` st left join `shot_inputs` si on st.inputId = si.id group by si_title, sid , s_tagId ) sti on t.id = sti.s_tagId ORDER BY `tag_id` ASC;

(async () => {
    try {
        console.log('[+] Shot export ai excel')
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const categories = (await Category.findAll({}))?.map(x => x.toJSON()) || []

        let categoryItems = []

        const inputs = await ShotInput.findAll({});
        const schema = [
            { column: "", value: item => item.tag_title },
            { column: "مجموع", value: item => item.total },
            ...inputs.map(it => ({ column: it.title, value: item => item[it.id.toString()] })),
            { column: "تگ هایی که در تصویر میبنید", value: item => item["tagInVideo"] }
        ]

        for (let i = 0; i < categories.length; i++) {
            const category = categories[i]
            const data = { categoryId: category.id, categoryName: category.name, tags: [] }

            const shotsOfCategoryQuery = "SELECT DISTINCT(shotId) as shotId FROM `shot_category` where categoryId=:categoryId;"
            let shotsOfCategory = (await sequelize.query(shotsOfCategoryQuery, { replacements: { categoryId: category.id }, type: QueryTypes.SELECT })).map(x => x.shotId);

            console.log(333333333, " fetching tags of category " + category.name + " with categoryId " + category.id + " is started")

            let index = 0
            let count = 200

            while (true) {
                let shots = shotsOfCategory.slice(index, count)
                if (shots.length == 0) break

                // console.log(shots.join(","))
                // const tagsQuery = "SELECT t.id as tag_id , t.tag as tag_title, sti.sid as input_id , sti.si_title as input_title, COALESCE(scount, 0) as shot_count FROM `tags` t left join (select st.tagId as s_tagId, si.title as si_title , si.id as sid, COUNT(st.`shotId`) as scount , st.shotId as st_shotId from `shot_tag` st left join `shot_inputs` si on st.inputId = si.id group by si_title, sid , s_tagId ) sti on t.id = sti.s_tagId WHERE sti.st_shotId IN (:shots)"
                const tagsQuery = "select st.tagId as s_tagId, tt.tag as tag_name, si.title as si_title, si.id as sid, COUNT(st.`shotId`) as scount, st.shotId as st_shotId from `shot_tag` st left join `shot_inputs` si on st.inputId = si.id left join `tags` tt on st.tagId = tt.id where st.shotId IN (:shots) group by si_title, sid, s_tagId"
                let tags = await sequelize.query(tagsQuery, { replacements: { shots }, type: QueryTypes.SELECT })
                data.tags = [...tags, ...data.tags]

                console.log(3333333, "index=" + index + " count " + count + " tags fetching " + data.tags.length)
                index = count
                count += 200
            }
            console.log(333333333, "category=" + category.name + " with categoryId=" + category.id + " have " + data.tags.length + " total tags ")
            categoryItems.push(data)
        }


        let fullSchema = [];
        let fullData = [];
        let sheetsNames = []
        for (let i = 0; i < categoryItems.length; i++) {
            const { categoryId, categoryName, tags } = categoryItems[i];

            let rows = []
            for (let i = 0; i < tags.length; i++) {
                let { s_tagId: tag_id, tag_name: tag_title, sid:input_id, input_title, scount: shot_count } = tags[i]
                let rowIndex = rows.findIndex(it => it.tag_id == tag_id);
                if (rowIndex === -1) {
                    rowIndex = rows.push({ tag_id, tag_title })
                    rowIndex -= 1;
                }

                // if (inVideo == 1) {
                //     rows[rowIndex]["tagInVideo"] = shot_count;
                // } else if (!!input_id) {

                if (!input_id) input_id = "tagInVideo"
                if (!(rows?.[rowIndex]?.[input_id.toString()])) rows[rowIndex][input_id.toString()] = 0
                rows[rowIndex][input_id.toString()] += shot_count;
                
                if (!rows[rowIndex]?.['total']) rows[rowIndex]['total'] = 0
                rows[rowIndex]['total'] += shot_count
            }
            sheetsNames.push(categoryName)
            fullSchema.push(schema)
            fullData.push(rows)
        }

        await writeXlsxFile(
            fullData,
            {
                schema: fullSchema,
                sheets: sheetsNames,
                filePath: path.join(__dirname, "shot_tags.xlsx")
            }
        )
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
