const { Route } = require("../models");

const authorization = async (req, res, next) => {
  try {
    let Route = await Route.findByPk(req.params.id);
    if (!Route) {
      throw { name: "Not Found" };
    }
    if (req.user.role == "admin") {
      next();
    } else if (Route.UserId == req.user.id) {
      next();
    } else {
      throw { name: "Forbidden" };
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = authorization;
