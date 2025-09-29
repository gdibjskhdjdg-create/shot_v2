const { Sequelize } = require("sequelize");
const { configLog } = require("../helper/showLog");

class DBConnection {
    static async ping() {
        if (this.instance) {
            try {
                await this.instance.authenticate();
                configLog(`[+] Connected to Postgres`)
            }
            catch (err) {
                console.error("Error in Postgres connection")
                console.log(err);
                process.exit(0);
            }
        }
    }

    static connection(dbConfigs = null) {
        if (!this.instance && dbConfigs !== null) {
            this.instance = new Sequelize(
                dbConfigs.db,
                dbConfigs.username,
                dbConfigs.password,
                {
                    host: dbConfigs.host,
                    port: dbConfigs.port,
                    dialect: dbConfigs.dialect,
                    logging: false
                }
            );
        }


        return this.instance;
    }

    static async getTransaction() {
        const transaction = await (DBConnection.connection()).transaction();
        return transaction;
    }
}

module.exports = DBConnection