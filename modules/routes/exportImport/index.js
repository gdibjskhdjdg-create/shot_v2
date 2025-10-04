const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ExportImportController = require("../../controllers/exportImport/ExportImport.controller");

/* ------------------------------ prefix: /api/export-import ------------------------------ */
async function exportImportRoutes(fastify, opts) {

    fastify.post("/export/with-project", AsyncHandler(ExportImportController.exportData));
    fastify.post("/import", AsyncHandler(ExportImportController.importData));
    // router.use(OnlyLoginUserMiddleware());
}
module.exports = exportImportRoutes;