module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users",
            keys: "id",
            as: "user",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    scoreKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    score: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "0"
    },

    section: {
        type: DataTypes.STRING,
        allowNull: false,
    }

})