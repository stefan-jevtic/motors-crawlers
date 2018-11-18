/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('listing_queue', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    start_url: {
      type: DataTypes.STRING(512),
      allowNull: false,
      defaultValue: ''
    },
    spider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },
    run_sequence_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    num_failures: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    last_page: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('READY','RESERVED'),
      allowNull: false,
      defaultValue: 'READY'
    },
    reserved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'listing_queue',
    timestamps: false
  });
};
