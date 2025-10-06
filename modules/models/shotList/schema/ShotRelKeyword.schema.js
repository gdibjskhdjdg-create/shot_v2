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
    inputId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "shot_inputs",
            keys: "id",
            as: "shotInput",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    inVideo: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0
    },
    otherInfo: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})