const AsyncHandler = require("../../../helper/asyncHandler.tool");
const ExportImport = require("../../controllers/exportImport/ExportImport.controller");

/* ------------------------------ prefix: /api/export-import ------------------------------ */
async function exportImportRoutes(fastify, opts) {

    fastify.post("/export/with-project", AsyncHandler(ExportImport.exportFullData));
    fastify.post("/import", AsyncHandler(ExportImport.importFullData));
    // router.use(OnlyLoginUserMiddleware());
}
module.exports = exportImportRoutes;