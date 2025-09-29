module.exports = (DataTypes) => ({
    
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
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
    startTime: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    endTime: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
    },
    mode: {
        allowNull: false,
        type: DataTypes.ENUM("create", "update", 'equalizer'),
        default: 'create'
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