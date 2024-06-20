"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Route extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Route.belongsTo(models.User, {
        foreignKey: "UserId",
      });
    }
  }
  Route.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        validate: {
          notEmpty: {
            msg: "UserId is required",
          },
          notNull: {
            msg: "UserId is required",
          },
        },
      },
      startLat: DataTypes.FLOAT,
      startLng: DataTypes.FLOAT,
      endLat: DataTypes.FLOAT,
      endLng: DataTypes.FLOAT,
      trafficInfo: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Route",
    }
  );
  return Route;
};
