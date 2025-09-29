module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    defaultPath: {
        type: DataTypes.STRING(1000),
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING(255),
        required: true,
    },
    titleEn: {
        type: DataTypes.STRING(255),
        defaultValue: "",
    },
    code: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    template: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    structure: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    type: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    producer: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    director: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    shotStatus: { // shotting , equalized, equalizing
        type: DataTypes.STRING(20),
        allowNull: true
    },
    workTimeRatio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    equalizeRatio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    productionYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    UUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
    }
})