const BaseController = require("../../_default/controller/Base.controller");
const { exportImportService } = require("../../services/exportImport/index");

async function exportFullData(req, res) {
    const body = req.body;
    let result = {}
    result = await exportImportService.exportFullDataWithProject(body.projectIds);
    return BaseController.ok(res, result)
}

async function importFullData(req, res) {
    const { originalFilename, newPath } = await exportImportService.saveFullDataImportFile(req);
    let result = await exportImportService.importFullDataFile(originalFilename, newPath)
    return BaseController.ok(res, result)

}

module.exports = {
    exportFullData,
    importFullData
};