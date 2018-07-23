module.exports = function (sequelize, DataTypes) {
    let goods = sequelize.define('goods',
        {
            goodsid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING
            },
            credits_price: {
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
            tableName: 't_goods',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );
    return goods;
};