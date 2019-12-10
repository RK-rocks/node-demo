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
    password: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    mobile_no: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    is_varified: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    is_address_added: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    varification_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    fp_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    google_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    facebook_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    twitter_id: {
      type: DataTypes.INTEGER(11),
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
