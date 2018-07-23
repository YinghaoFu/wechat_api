module.exports = function (sequelize, DataTypes) {
    let user = sequelize.define(
        'user',
        {
            userid: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING
            },
            credits: {
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
            tableName: 't_user',
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );
    return user;
};