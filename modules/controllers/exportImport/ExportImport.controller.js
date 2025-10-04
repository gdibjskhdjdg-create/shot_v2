const ResponseDTO = require("../../_default/Response.dto");
const { exportImportService } = require("../../services/exportImport/index");

async function exportData(req, res) {
    const body = req.body;
    let result = {}
    result = await exportImportService.exportFullDataWithProject(body.projectIds);
    return ResponseDTO.success(res, result)
}

async function importData(req, res) {
    const { originalFilename, newPath } = await exportImportService.saveFullDataImportFile(req);
    let result = await exportImportService.importFullDataFile(originalFilename, newPath)
    return ResponseDTO.success(res, result)

}

module.exports = {
    exportData,
    importData
};