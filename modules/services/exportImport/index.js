const exportImportService = require("./ExportImport.service");
const shotLogService = require("../shotList/ShotLog.service");
const shotService = require("../shotList/Shot.service");
const equalizerService = require("../shotList/Equalizer.service");
const videoDetailLogService = require("../videoDetail/VideoDetailLog.service");
const videoDetailService = require("../videoDetail/VideoDetail.service");

// Since services are now function modules, we pass the modules directly.
const instantiatedExportImportService = exportImportService(
    shotLogService, 
    shotService, 
    equalizerService, 
    videoDetailLogService,
    videoDetailService,
);

module.exports = {
    exportImportService: instantiatedExportImportService,
};