module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categories_of_tag",
            keys: "id",
            as: "category_tag",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "tags",
            keys: "id",
            as: "tag",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
})