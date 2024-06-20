const { Route } = require("../models");

class RouteController {
  static async createRoute(req, res, next) {
    try {
      const { startLat, startLng, endLat, endLng, trafficInfo } = req.body;
      const UserId = req.user.id;
      const newRoute = await Route.create({
        UserId,
        startLat,
        startLng,
        endLat,
        endLng,
        trafficInfo,
      });
      res.status(201).json(newRoute);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  static async getRoutes(req, res, next) {
    try {
      const routes = await Route.findAll({ where: { UserId: req.user.id } });
      res.status(200).json(routes);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  static async deleteRoute(req, res, next) {
    try {
      const routeId = req.params.id;
      const route = await Route.findByPk(routeId);
      if (!route) {
        throw { name: "RouteNotFound" };
      }
      await route.destroy();
      res.status(200).json({ message: "Route deleted successfully" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}

module.exports = RouteController;
