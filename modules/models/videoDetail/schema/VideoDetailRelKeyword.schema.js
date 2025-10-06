module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
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
    keywordId: {
        type: DataTypes.INTEGER,
        references: {
            model: "keywords",
            key: "id",
            as: "keyword",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    inputId: {
        type: DataTypes.INTEGER,
        references: {
            model: "shot_inputs",
            key: "id",
            as: "shotInput",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    inVideo: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    otherInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})