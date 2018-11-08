/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('resellers', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      defaultValue: ''
    },
    reseller_code: {
      type: DataTypes.STRING(60),
      allowNull: true,
      defaultValue: ''
    },
    reseller_type: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    source_code: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      defaultValue: ''
    },
    logo: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    votes: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0'
    },
    rating: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    store_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    first_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    vat: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    company_registration_number: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile_phone: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fax: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    additional_contact_information: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    full_address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    street_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    route: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    locality: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    admin_area_level_2: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    admin_area_level_1: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    geo_lat: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_lng: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_bounds_south_lat: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_bounds_south_lng: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_bounds_north_lng: {
      type: "DOUBLE",
      allowNull: true
    },
    geo_bounds_north_lat: {
      type: "DOUBLE",
      allowNull: true
    },
    place_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    seller_group: {
      type: DataTypes.STRING(100),
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
    tableName: 'resellers',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
  });
};
