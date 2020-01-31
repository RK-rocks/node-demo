/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_orders', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    order_id: {
      type: DataTypes.STRING(56),
      allowNull: false
    },
    product_color_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbl_product_colors',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbl_user',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbl_product',
        key: 'id'
      }
    },
    pad_name: {
      type: DataTypes.TEXT(256),
      allowNull: true
    },
    total_item: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    price_total: {
      type: DataTypes.FLOAT(11),
      allowNull: false
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
    tableName: 'tbl_orders'
  });
};
