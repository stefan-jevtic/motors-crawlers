/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currency_conversions', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    from: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: ''
    },
    EUR: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    PLN: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'currency_conversions',
    timestamps: false
  });
};
