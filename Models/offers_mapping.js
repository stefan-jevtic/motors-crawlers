/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('offers_mapping', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    source_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: false
    },
    offer_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    brand_id: {
      type: DataTypes.INTEGER(11).UNSIGNED,
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    model: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    version: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dealer_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: true
    }
  }, {
    tableName: 'offers_mapping',
    timestamps: false
  });
};
