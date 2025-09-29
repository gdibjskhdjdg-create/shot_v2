module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },

    exportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "export_video_files",
            keys: "id",
            as: "export",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    videoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "video_files",
            keys: "id",
            as: "video",
        },
        onUpdate: "SET NUll",
        onDelete: "SET NUll",
    },
    shotId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "shots",
            keys: "id",
            as: "shot",
        },
        onUpdate: "SET NUll",
        onDelete: "SET NUll",

    },
    startCutTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    endCutTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    pid: {
        allowNull: true,
        type: DataTypes.STRING(20),
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM("queue", "pending", 'error', 'complete'),
        defaultValue: 'queue'
    },
    lastCommand: {
        allowNull: true,
        type: DataTypes.TEXT,
    },
    startTimeLastCommand: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    endTimeLastCommand: {
        type: DataTypes.DATE,
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