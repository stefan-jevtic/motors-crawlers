/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('offers_archive', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    brand_id: {
      type: DataTypes.INTEGER(15),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    cond: {
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
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    photo_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    source_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    offer_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reseller_code: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    scope: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    price_net: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    price_gross: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    vat: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    kilometer: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    dealer_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    original_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    origin_url: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    run_sequence_id: {
      type: DataTypes.INTEGER(11),
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
    tableName: 'offers_archive',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
