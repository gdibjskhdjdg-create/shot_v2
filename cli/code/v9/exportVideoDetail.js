const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Category, VideoFile, VideoDetailRelTag, Project, VideoDetail } = require("../../../modules/_default/model");
const { default: writeXlsxFile } = require("write-excel-file/node");


(async () => {
    try {
        console.log('[+] Video export ai excel')
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const categories = (await Category.findAll({}))?.map(x => x.toJSON()) || [];

        
        const schema = [
            { column: "شناسه", value: item => item.id },
            { column: "عنوان", value: item => item.title },
            { column: "زمان", value: item => item.duration },
            { column: "پروژه", value: item => item.project },
            { column: "تعداد تگ", value: item => item.tagsCount },
            { column: "تعداد موضوع", value: item => item.catLength },
            ...categories.map(it => ({ column: it.name, value: item => item.categories?.[it.id.toString()] || 0 })),
        ]

        let videoData = [];
        const take = 1000;
        let biggestId = 0;
        let i = 0;
        while(true){
            i++;
            const videos =  await VideoDetail.findAll({
                where: { 
                    videoFileId: { [Op.gt]: biggestId },
                },
                include: [                
                { model: Category, attributes: ['id'], as: 'category' },
                { model: VideoDetailRelTag, as: 'tagIds' },
                { model: Project, as: "project", attributes: ['id', 'title'] },
                {
                    model: VideoFile,
                    attributes: [ 'duration' ],
                    as: 'videoFile',
                },
                ],
                limit: take,
            });

            if(videos.length === 0){
                break;
            }

            biggestId = Math.max(...videos.map(item => item.videoFileId)); // Update biggestId

            videos.forEach(item => {
                const cats = {};
                item.category.forEach(it => {
                    cats[it.id.toString()] = 1
                })
                videoData.push({
                    id: item.videoFileId,
                    title: item.title,
                    duration: item?.videoFile?.duration || null,
                    project: item.project?.title,
                    tagsCount: item.tagIds.length,
                    categories: cats,
                    catLength: item.category.length
                })
            })

            console.log("Get data: " + (take * i) + " - " + biggestId);
        }

        await writeXlsxFile(
            [videoData],
            {
                schema: [schema],
                sheets: ["all"],
                filePath: path.join(__dirname, "video_detail.xlsx")
            }
        )
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()
