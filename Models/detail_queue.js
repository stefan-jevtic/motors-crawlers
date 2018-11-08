/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('detail_queue', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    start_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ''
    },
    spider: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: ''
    },
    num_failures: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
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
    tableName: 'detail_queue',
    timestamps: false
  });
};
