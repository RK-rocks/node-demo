/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tbl_user_cart', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    total_item: {
      type: DataTypes.INTEGER(11),
      allowNull: false
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
    product_color_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbl_product_colors',
        key: 'id'
      }
    },
    product_image_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'tbl_product_images',
        key: 'id'
      }
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
    tableName: 'tbl_user_cart'
  });
};
