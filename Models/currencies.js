/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('currencies', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    iso_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: '0',
      unique: true
    },
    iso_code_num: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: '0'
    },
    sign: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    blank: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    format: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '0'
    },
    decimals: {
      type: DataTypes.INTEGER(1).UNSIGNED,
      allowNull: false,
      defaultValue: '1'
    },
    conversion_rate: {
      type: DataTypes.DECIMAL,
      allowNull: false
    }
  }, {
    tableName: 'currencies',
    timestamps: false
  });
};
