/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('attribute_definitions', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    attribute_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '',
      unique: true
    },
    hint: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    attribute_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'select'
    },
    ignore: {
      type: DataTypes.INTEGER(1),
      allowNull: true
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
    tableName: 'attribute_definitions',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
