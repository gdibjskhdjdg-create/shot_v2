module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "projects",
            key: "id",
            as: "Project",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            key: "id",
            as: "user",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    shotCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalPath: {
        type: DataTypes.STRING(500),
        allowNull: true,
    },

    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    path: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    format: {
        type: DataTypes.STRING(15),
        allowNull: true,
    },
    width: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    height: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    duration: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    frameRate: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    aspectRatio: {
        type: DataTypes.STRING(10),
        allowNull: true
    },

    bitrate:{
        type: DataTypes.STRING(20),
        allowNull: true
    },

    fullInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        // 0 = encode queue
        // 1 = error get info 
        // 2 = encode process 
        // 3 = encode complete 
        // 4 = encode error 
        // 5 = assigned shot 
        // 6 = not file
        type: DataTypes.SMALLINT,
        defaultValue: 0,
    },
    UUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    isImportant: {
        allowNull: false,
        type: DataTypes.SMALLINT,
        defaultValue: 0
    },
    
    referralAt: {
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