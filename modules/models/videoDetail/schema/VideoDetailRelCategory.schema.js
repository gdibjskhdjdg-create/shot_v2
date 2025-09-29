module.exports = (DataTypes) => ({

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
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: "categories",
            key: "id",
            as: "categories",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
})