/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_user', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING(56),
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING(56),
      allowNull: false
    },
    mobile_no: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    is_deleted: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    is_active: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'tbl_user'
  });
};
