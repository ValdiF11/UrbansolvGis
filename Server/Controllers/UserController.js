const { comparePassword } = require("../helper/bycript");
const { createToken } = require("../helper/jwt");
const { User } = require("../models");

class UserController {
  static async register(req, res, next) {
    try {
      const { name, username, email, password } = req.body;
      console.log(name, username, email, password);
      await User.create({ name, username, email, password });
      let user = await User.findOne({ where: { email }, attributes: { exclude: ["password"] } });
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
  static async login(req, res, next) {
    try {
      const { email, username, password } = req.body;
      if (!email && !username) {
        throw { name: "Invalid Input" };
      }
      if (!password) {
        throw { name: "Invalid Input" };
      }
      let user;
      if (email) {
        user = await User.findOne({ where: { email }, attributes: { exclude: ["password"] } });
      } else if (username) {
        user = await User.findOne({ where: { username }, attributes: { exclude: ["password"] } });
      }

      if (!user) {
        throw { name: "Invalid User" };
      }

      let compare = comparePassword(password, user.password);
      if (!compare) {
        throw { name: "Invalid User" };
      }
      let token = createToken({ id: user.id });
      res.status(200).json({ access_token: token });
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
}

module.exports = UserController;
