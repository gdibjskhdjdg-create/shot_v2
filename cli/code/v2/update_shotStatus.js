const path = require("path");
require("../../../configs");
require("app-module-path").addPath(path.join(__dirname, "..", ".."));
const DBConnection = require("../../../db/DBConnection");

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Shot, VideoFile, EqualizerLog, ShotLog } = require("../../../modules/_default/model");

(async () => {
    try {
        DBConnection.connection(appConfigs.DB);
        await DBConnection.ping();

        const take = 500;
        let biggestId = 0;

        while (true) {
            const items = await Shot.findAll({
                where: {
                    id: { [Op.gt]: biggestId },
                    status: null
                },
                limit: +take,
            });

            if (items.length === 0) {
                break;
            }

            const shotsId = items.map(x => x.id)
            const shotsLog = (await ShotLog.findAll({ where: { shotId: shotsId } })).map(x => x.toJSON())
            const equalizersLog = (await EqualizerLog.findAll({ where: { shotId: shotsId } })).map(x => x.toJSON())
            // const nothingVideos = (await VideoFile.findAll({ where: { id: videosId, path: 'nothing' } })).map(x => x.toJSON())

            for (const item of items) {
                biggestId = item.id;

                let newStatus = null

                // const findNothingVideo = nothingVideos.find(x => x.videoFileId == item.videoFileId)

                if (item.lastEqualizeLogId !== null) {
                    const equalizerLog = equalizersLog.find(x => x.id == item.lastEqualizeLogId)
                    if (equalizerLog) {
                        newStatus = { 
                            'confirm': 'equalize_confirm', 
                            'confirm_edit': 'equalize_confirm_edit', 
                            'need_meeting': 'equalize_need_meeting' 
                        }[equalizerLog.status]
                    }
                }
                else {
                    const findShotLog = shotsLog.find(x => x.shotId == item.id)
                    newStatus = findShotLog ? 'equalizing' : 'init-check'
                }

                item.status = newStatus
                await item.save()
            }
        }
    }
    catch (err) {
        console.log(err)
    }

    process.exit();
})()