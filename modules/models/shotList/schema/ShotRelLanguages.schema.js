module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT.UNSIGNED,
    },
    shotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "shots",
            keys: "id",
            as: "shot",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    languageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "languages",
            keys: "id",
            as: "language",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    type: {
        type: DataTypes.STRING(20), // mainLanguage, subtitle, narration, dubbed
        allowNull: false
    }
})