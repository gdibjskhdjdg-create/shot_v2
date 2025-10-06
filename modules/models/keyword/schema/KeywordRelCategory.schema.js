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
            model: "categories_of_keyword",
            keys: "id",
            as: "category_keyword",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    keywordId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "keywords",
            keys: "id",
            as: "keyword",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
})