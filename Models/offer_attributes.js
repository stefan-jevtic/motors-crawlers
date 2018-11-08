/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('offer_attributes', {
    bigint: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    offer_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    attribute_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: ''
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    source_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false
    },
    is_option: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    checked: {
      type: DataTypes.INTEGER(1),
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
    tableName: 'offer_attributes',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
