module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    firstName: {
        type: DataTypes.STRING(20),
        defaultValue: "",
    },
    lastName: {
        type: DataTypes.STRING(20),
        defaultValue: "",
    },
    fullName: {
        type: DataTypes.STRING(45),
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    permission: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'user',
    },
    isActive: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    deletedAt: {
        allowNull: true,
        type: DataTypes.DATE,
    }
})