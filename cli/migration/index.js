require("../../configs");
require("app-module-path").addPath(__dirname);
const DBConnection = require("../../db/DBConnection");

const fs = require('fs');
const { readdir } = require('fs/promises');
const path = require('path');
const Sequelize = require('sequelize');

const { SequelizeMigrations } = require("./model");
const { configLog } = require("../../helper/showLog");


const findMigrationFiles = async () => {
    let migrationFiles = [];

    const modulePath = path.join(__dirname, '..', '..', 'modules', "migrations");
    const moduleFolders = await readdir(modulePath);

    for (let i = 0; i < moduleFolders.length; i++) {
        const folderPath = path.join(modulePath, moduleFolders[i]);
        if (fs.existsSync(folderPath)) {
            let migrateFiles = await readdir(folderPath);
            migrateFiles = migrateFiles.map(item => ({
                name: item,
                fullPath: path.join(folderPath, item),
                path: path.join("modules", 'migrations', moduleFolders[i], item)
            }));

            migrationFiles = [...migrationFiles, ...migrateFiles]
        }
    }

    return migrationFiles.sort((a, b) => parseInt(a.name) - parseInt(b.name));
}

const createMigrateTable = async () => {
    const sequelize = DBConnection.connection();
    const DataTypes = Sequelize.DataTypes;

    const Model = sequelize.define("sequelize_migrations",
        {
            name: DataTypes.STRING(1000),
            path: {
                type: DataTypes.STRING(1000),
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        },
    );

    await Model.sync()
}


(async () => {
    await createMigrateTable();

    let migrationFiles = await findMigrationFiles();

    const sequelize = DBConnection.connection();
    const queryInterface = sequelize.getQueryInterface();

    const allFiles = await SequelizeMigrations.findAll();
    const allFileNames = allFiles.map(item => item.name);

    const newMigrationFile = migrationFiles.filter(item => !allFileNames.includes(item.name));
    console.log(newMigrationFile)

    for (let i = 0; i < newMigrationFile.length; i++) {
        await require(newMigrationFile[i].fullPath).up(queryInterface, Sequelize);

        await SequelizeMigrations.create({
            name: newMigrationFile[i].name,
            path: newMigrationFile[i].path,
        });

        configLog(newMigrationFile[i])
    }

    process.exit(0)
})()