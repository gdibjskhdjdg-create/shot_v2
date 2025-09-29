const path = require("path");
const fs = require("fs");
const rfs = require("rotating-file-stream");

function LoggingError(app, configs) {
    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '..', "logs", "access");
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Custom logging hook for request/response logging
    app.addHook('onResponse', (request, reply, done) => {
        const now = new Date();
        const logMessage = `${now.toISOString()} ${request.method} ${request.url} ${reply.statusCode} - ${reply.getResponseTime().toFixed(2)}ms ${request.ip} "${request.headers.referer || ''}" "${request.headers['user-agent'] || ''}"`;
        
        if (configs.SHOW_LOG === "store" || configs.SHOW_LOG === "full") {
            // Write to rotating file stream
            const accessLogStream = rfs.createStream("access.log", {
                interval: "1d",
                path: logsDir,
            });
            accessLogStream.write(logMessage + '\n');
        }

        if (configs.SHOW_LOG === "show" || configs.SHOW_LOG === "full") {
            console.log(logMessage);
        }
        
        done();
    });

    // Error logging hook
    app.addHook('onError', (request, reply, error, done) => {
        const now = new Date();
        const errorLog = `${now.toISOString()} ERROR: ${error.message} - ${request.method} ${request.url} ${request.ip}`;
        
        if (configs.SHOW_LOG === "store" || configs.SHOW_LOG === "full") {
            const errorLogStream = rfs.createStream("error.log", {
                interval: "1d",
                path: logsDir,
            });
            errorLogStream.write(errorLog + '\n');
        }

        if (configs.SHOW_LOG === "show" || configs.SHOW_LOG === "full") {
            console.error(errorLog);
        }
        
        done();
    });
}

module.exports = LoggingError;

// const path = require("path");
// const fs = require("fs");
// const rfs = require("rotating-file-stream");
// const morgan = require("morgan");


// function LoggingError(app, configs){

//     if (configs.SHOW_LOG === "store" || configs.SHOW_LOG === "full") {
//         if (!fs.existsSync(path.join(__dirname, '..', "logs", "access"))) {
//             fs.mkdirSync(path.join(__dirname, '..', "logs", "access"), { recursive: true });
//         }
    
//         const accessLogStream = rfs.createStream("access.log", {
//             interval: "1d", // rotate daily
//             path: path.join(__dirname, "logs", "access"),
//         });

//         app.use(
//             morgan(
//                 ':date :method :url :status :res[content-length] - :response-time ms :remote-addr ":referrer" ":user-agent"',
//                 { stream: accessLogStream }
//             )
//         );
//     }
    
//     if (configs.SHOW_LOG === "show" || configs.SHOW_LOG === "full") {
//         app.use(morgan("dev"));
//     }
// }

// module.exports = LoggingError;