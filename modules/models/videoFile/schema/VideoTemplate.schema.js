module.exports = (DataTypes) => ({

    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    title: {
        allowNull: false,
        type: DataTypes.STRING(255),
    },

    quality: {
        type: DataTypes.INTEGER(5),
        allowNull: true,
    },
    isMute: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },

    bitrate: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    gifTime: {
        allowNull: true,
        type: DataTypes.TEXT, // json params [start, end]
    },

    logoParams: {
        allowNull: true,
        type: DataTypes.TEXT, // json params
    },
    textParams: {
        allowNull: true,
        type: DataTypes.TEXT, // json params
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