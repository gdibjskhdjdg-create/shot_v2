#!/usr/bin/env node
/* ----------------- Set all .env variables in "appConfigs" ----------------- */

require("./configs");
require("app-module-path").addPath(__dirname);

const debug = require("debug")("panel:server");
const fs = require("fs");

const DBConnection = require("./db/DBConnection");
const { log, configLog } = require("./helper/showLog");

(async () => {
    // Initialize database connection
    DBConnection.connection(appConfigs.DB);
    await DBConnection.ping();

    /**
     * Create Fastify server instance
     */
    const fastify = require("./app"); // Your Fastify app from previous conversion

    /**
     * Get port from environment
     */
    const PORT = appConfigs.APP_PORT || "3000";
    const HOST = appConfigs.APP_HOST || "0.0.0.0";

    /**
     * Start the server with HTTP or HTTPS
     */
    try {
        let serverOptions = {
            port: Number(PORT),
            host: HOST
        };

        // Add HTTPS options if needed
        if (appConfigs.APP_PROTOCOL === "https") {
            serverOptions = {
                ...serverOptions,
                https: {
                    key: fs.readFileSync(appConfigs.HTTPS_KEY_FILE),
                    cert: fs.readFileSync(appConfigs.HTTPS_CERT_FILE),
                }
            };
        }

        // Start the Fastify server
        await fastify.listen(serverOptions);
        
        configLog(`[+] server started at: ${appConfigs.APP_PROTOCOL}://${HOST}:${PORT}`);
        configLog(`[+] server started at: ${appConfigs.APP_URL}`);

        // Set up event listeners
        fastify.server.on('error', onError);
        fastify.server.on('listening', onListening);

    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }

    /* Event listener for HTTP server "error" event. */
    function onError(error) {
        if (error.syscall !== "listen") {
            throw error;
        }

        const bind = typeof PORT === "string" ? "Pipe " + PORT : "Port " + PORT;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case "EADDRINUSE":
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /* Event listener for HTTP server "listening" event. */
    function onListening() {
        const addr = fastify.server.address();
        const bind =
            typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
        debug("Listening on " + bind);
    }
})();