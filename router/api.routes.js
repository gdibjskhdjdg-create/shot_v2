const userRoute = require("../modules/routes/user");
const keywordRoute = require("../modules/routes/keyword");
const projectRoute = require("../modules/routes/project");
const ownerRoute = require("../modules/routes/owner");
const shotListRoute = require("../modules/routes/shotList");
const videoFileRoute = require("../modules/routes/videoFile");
const videoInfoRoute = require("../modules/routes/videoInfo");
const languageRoute = require("../modules/routes/language");
const exportImportRoute = require("../modules/routes/exportImport");
/* ------------------------------ prefix: /api ------------------------------ */


async function apiRoutes(fastify, opts) {

    fastify.register(userRoute, { prefix: '/user' });
    fastify.register(exportImportRoute, { prefix: '/export-import' });
    fastify.register(keywordRoute, { prefix: '/tag' });
    fastify.register(projectRoute, { prefix: '/project' });
    fastify.register(languageRoute, { prefix: '/language' });
    fastify.register(shotListRoute, { prefix: '/shotList' });
    fastify.register(ownerRoute, { prefix: '/owner' });
    fastify.register(videoFileRoute, { prefix: '/videoFile' });
    fastify.register(videoInfoRoute, { prefix: '/videoDetail' });

    // register other routes similarly
}

module.exports = apiRoutes;