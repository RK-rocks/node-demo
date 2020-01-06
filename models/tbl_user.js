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
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(56),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    profile_image: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    mobile_no: {
      type: DataTypes.STRING(56),
      allowNull: true
    },
    is_varified: {
      type: DataTypes.ENUM('yes','no'),
      allowNull: false,
      defaultValue: 'no'
    },
    is_subscribed: {
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
    login_with: {
      type: DataTypes.ENUM('0','1','2','3'),
      allowNull: false,
      defaultValue: '0'
    },
    fp_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    google_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    facebook_id: {
      type: DataTypes.STRING(256),
      allowNull: true
    },
    twitter_id: {
      type: DataTypes.STRING(256),
      allowNull: true
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
