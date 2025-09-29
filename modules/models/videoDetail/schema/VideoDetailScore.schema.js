module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: "users",
            key: "id",
            as: "user",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    videoFileId: {
        type: DataTypes.INTEGER,
        references: {
            model: "video_detail",
            key: "videoFileId",
            as: "videoDetail",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },

    scoreKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    score: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
    },

    section: {
        type: DataTypes.STRING,
        allowNull: false,
    }

})