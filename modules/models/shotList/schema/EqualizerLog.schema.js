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
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
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
    startTime: {
        type: DataTypes.STRING(30),
        allowNull: false,
    },
    endTime: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(20), //confirm, confirm_edit, need_meeting
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    oldData: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
    },
    newData: {
        type: DataTypes.TEXT("long"),
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