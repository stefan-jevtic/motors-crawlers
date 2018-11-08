/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sources_brands', {
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
    brand_id: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    brand_source_code: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'sources_brands',
    timestamps: false
  });
};
