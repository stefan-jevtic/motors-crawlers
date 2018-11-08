/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sources_country_codes', {
    id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    source_id: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    enabled: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: '1'
    }
  }, {
    tableName: 'sources_country_codes',
    timestamps: false
  });
};
