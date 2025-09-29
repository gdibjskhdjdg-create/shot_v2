'use strict';

const { errorLog } = require("../../../helper/showLog");

module.exports = {
    async up(queryInterface, Sequelize) {
        try{
            await queryInterface.addColumn("users", "isActive", {
                type: Sequelize.SMALLINT,
                defaultValue: 1,
                after: "permission",
                allowNull: false,
            });
        }
        catch(err){
            errorLog("[-] Error in create isActive in users table")
        }
    },
    async down(queryInterface, Sequelize) {
        try{
            await queryInterface.removeColumn("users", "isActive");
        }
        catch(err){}
    }
};