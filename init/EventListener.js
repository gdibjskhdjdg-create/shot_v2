const path = require('path');
const emitter = require("./../modules/_default/eventEmitter");
const FindByExtensionHelper = require('../helper/FindByExtension.helper');


(async () => {
    const listenerFiles = await FindByExtensionHelper(path.join(__dirname, "..", "modules", "event"), 'listener.js');

    listenerFiles.map(item => require(item)).forEach(listener => {
        new listener(emitter)
    });
})()