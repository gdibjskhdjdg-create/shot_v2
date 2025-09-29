module.exports = (DataTypes) => ({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
    },
    timestamp: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    day: {
        type: DataTypes.SMALLINT,
        allowNull: true,
    },
    month: {
        type: DataTypes.SMALLINT,
        allowNull: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM("jalali", 'hijri', 'gregorian'),
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