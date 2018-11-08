/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('countries', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    iso_code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true
    },
    country_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    call_prefix: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '0'
    },
    currency_code: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    tax_vat_prefix: {
      type: DataTypes.STRING(5),
      allowNull: true
    },
    geo_lat: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_lng: {
      type: "DOUBLE",
      allowNull: true
    }
  }, {
    tableName: 'countries',
    timestamps: false
  });
};
