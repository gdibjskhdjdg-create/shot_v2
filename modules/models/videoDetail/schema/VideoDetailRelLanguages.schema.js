module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    videoFileId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: "video_detail",
            key: "videoFileId",
            as: "videoDetail",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    languageId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: "languages",
            key: "id",
            as: "language",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    type: {
        type: DataTypes.STRING(20), // mainLanguage, subtitle, narration, dubbed
        allowNull: false
    }
})