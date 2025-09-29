module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    tag: {
        type: DataTypes.STRING(100),
        unique: {
            msg: "تگ تکراری می باشد"
        },
    },
    isCategory: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true,
        references: {
            model: "tags",
            keys: "id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
    },
    type: {
        type: DataTypes.STRING(20), // event, location
        allowNull: true,
    },
    UUID: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
    },
    typeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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