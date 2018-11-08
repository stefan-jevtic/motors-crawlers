/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('offers', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    offer_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    source_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    scope: {
      type: DataTypes.STRING(20),
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
    matched: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: '0'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    brand_id: {
      type: DataTypes.INTEGER(15),
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
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: ''
    },
    dealer_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    run_sequence_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    origin_url: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    price_alert: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0'
    },
    alert_type: {
      type: DataTypes.INTEGER(2),
      allowNull: true,
      defaultValue: '0'
    },
    alerted_at: {
      type: DataTypes.DATE,
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
    tableName: 'offers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
