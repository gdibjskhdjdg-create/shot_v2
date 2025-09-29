module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    exportId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "export_video_files",
            keys: "id",
            as: "export",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    status: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    objectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    log: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }

})