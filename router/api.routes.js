const userRoute = require("../modules/routes/user");
const tagRoute = require("../modules/routes/tag");
const projectRoute = require("../modules/routes/project");
const ownerRoute = require("../modules/routes/owner");
const shotListRoute = require("../modules/routes/shotList");
const videoFileRoute = require("../modules/routes/videoFile");
const videoDetailRoute = require("../modules/routes/videoDetail");
const languageRoute = require("../modules/routes/language");
const exportImportRoute = require("../modules/routes/exportImport");
/* ------------------------------ prefix: /api ------------------------------ */


async function apiRoutes(fastify, opts) {

    fastify.register(userRoute, { prefix: '/user' });
    fastify.register(exportImportRoute, { prefix: '/export-import' });
    fastify.register(tagRoute, { prefix: '/tag' });
    fastify.register(projectRoute, { prefix: '/project' });
    fastify.register(languageRoute, { prefix: '/language' });
    fastify.register(shotListRoute, { prefix: '/shotList' });
    fastify.register(ownerRoute, { prefix: '/owner' });
    fastify.register(videoFileRoute, { prefix: '/videoFile' });
    fastify.register(videoDetailRoute, { prefix: '/videoDetail' });

    // register other routes similarly
}

module.exports = apiRoutes;