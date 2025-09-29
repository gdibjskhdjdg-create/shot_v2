const path = require('path');
const FindByExtensionHelper = require('../helper/FindByExtension.helper');

(async () => {
    const cronJobs = await FindByExtensionHelper(path.join(__dirname, "..", "modules", "job"), 'cronjob.js');
    cronJobs.forEach(path => require(path));
})()