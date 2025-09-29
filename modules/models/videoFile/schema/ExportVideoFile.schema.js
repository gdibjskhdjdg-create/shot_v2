module.exports = (DataTypes) => ({

    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            keys: "id",
            as: "users",
        },
        onDelete: "SET null",
    },

    productId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },

    isProduct: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },

    productStatus: {
        allowNull: true,
        type: DataTypes.ENUM("queue", "pending", 'error', 'complete'),
    },

    gifTime: {
        allowNull: true,
        type: DataTypes.TEXT // [,]
    },

    startTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    endTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    qualityExport: {
        type: DataTypes.INTEGER(5),
        defaultValue: null
    },
    isMute: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    bitrate: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    code: {
        allowNull: false,
        type: DataTypes.STRING(255),
    },
    status: {
        allowNull: false,
        type: DataTypes.ENUM("queue", "pending", 'error', 'complete'),
        defaultValue: 'queue'
    },


    isImportant: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },

    logoParams: {
        allowNull: true,
        type: DataTypes.TEXT, // json params
    },
    textParams: {
        allowNull: true,
        type: DataTypes.TEXT, // json params
    },
    lastCommand: {
        allowNull: true,
        type: DataTypes.TEXT,
    },
    pid: {
        allowNull: true,
        type: DataTypes.STRING(20),
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