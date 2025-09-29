module.exports = (DataTypes) => ({

    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },

    name: {
        allowNull: false,
        type: DataTypes.STRING,
    },

    access: {
        allowNull: false,
        type: DataTypes.TEXT,
        defaultValue: "[]"
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