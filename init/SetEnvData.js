const secureEnv = require('secure-env');

let envPassword = "";
for(let i = 0; i < process.argv.length; i++){
    if(process.argv[i].includes("--envPassword")){
        envPassword = process.argv[i].split("=")[1];
        process.argv[i] = "";
        break;
    }
}

module.exports = secureEnv({ secret: envPassword });