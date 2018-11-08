/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute_mapping', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    source_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },
    locale: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    attribute_pattern: {
      type: DataTypes.STRING(200),
      allowNull: false,
      defaultValue: ''
    },
    attribute_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    process_order: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    }
  }, {
    tableName: 'attribute_mapping',
    timestamps: false
  });
};
