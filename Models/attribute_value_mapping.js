/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute_value_mapping', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    source_code: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    locale: {
      type: DataTypes.STRING(2),
      allowNull: true
    },
    attribute_key: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    attribute_value_pattern: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    attribute_value: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ignore: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    },
    process_order: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'attribute_value_mapping',
    timestamps: false
  });
};
