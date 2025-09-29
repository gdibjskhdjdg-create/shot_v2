module.exports = (DataTypes) => ({
    shotId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "shots",
            keys: "id",
            as: "shot",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    categoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: "categories",
            keys: "id",
            as: "categories",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
})