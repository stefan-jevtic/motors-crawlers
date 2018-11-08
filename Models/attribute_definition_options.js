/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute_definition_options', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    attribute_definition_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      references: {
        model: 'attribute_definitions',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    force_sort: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '0'
    },
    sort_order: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
      defaultValue: '1'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'attribute_definition_options',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
