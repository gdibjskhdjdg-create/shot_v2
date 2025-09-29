module.exports = (DataTypes) => ({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "users",
            keys: "id",
            as: "user",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },

    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "roles",
            keys: "id",
            as: "role",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
})