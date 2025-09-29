const BaseController = require("../../_default/controller/Base.controller");
const { exportImportService } = require("../../services/exportImport/index");

class ExportImportController {
    async exportFullData(req, res) {
        const body = req.body;
        let result = {}
        result = await exportImportService.exportFullDataWithProject(body.projectIds);
        return BaseController.ok(res, result)
    }

    async importFullData(req, res) {
        const { originalFilename, newPath } = await exportImportService.saveFullDataImportFile(req);
        let result = await exportImportService.importFullDataFile(originalFilename, newPath)
        return BaseController.ok(res, result)
    }
}

module.exports = new ExportImportController();