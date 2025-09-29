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
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: "users",
            key: "id",
            as: "user",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    startTime: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    endTime: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    mode: {
        allowNull: false,
        type: DataTypes.STRING(20),
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