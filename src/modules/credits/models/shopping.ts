module.exports = function (sequelize, DataTypes) {
    let shopping = sequelize.define(
        'shopping',
        {
            userid: {
                type: DataTypes.STRING,
                allowNull: false
            },
            goodsid:{
                type: DataTypes.STRING,
                allowNull: false
            },
            count:{
                type: DataTypes.STRING
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('now')
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: sequelize.fn('now')
            }
        },
        {
            tableName: 't_shopping',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    );
    return shopping;
};