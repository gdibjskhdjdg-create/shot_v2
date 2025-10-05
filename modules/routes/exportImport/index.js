const ErrorBoundary = require("../../../helper/errorBoundary.tool");
const ExportImportController = require("../../controllers/exportImport/ExportImport.controller");

/* ------------------------------ prefix: /api/export-import ------------------------------ */
async function exportImportRoutes(fastify, opts) {

    fastify.post("/export/with-project", ErrorBoundary(ExportImportController.exportData));
    fastify.post("/import", ErrorBoundary(ExportImportController.importData));
    // router.use(OnlyLoginUserMiddleware());
}
module.exports = exportImportRoutes;