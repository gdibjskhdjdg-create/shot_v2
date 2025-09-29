const chalk = require("chalk")

const log = (...args) => {
    showLog("green", "INFO", args)
};

const configLog = (...args) => {
    showLog("blue", "CONFIG", args)
};

const errorLog = (...args) => {
    showLog("red", "ERROR", args)
};

const showLog = (color, text, args) => {
    console.log(logTime(), process.pid, chalk.bold[color](`[${text}]`), ...args);
}

const logTime = () => {
    let nowDate = new Date();
    return nowDate.toLocaleDateString() + ' ' + nowDate.toLocaleTimeString([], { hour12: false });
};

module.exports = {
    log,
    errorLog,
    configLog
};