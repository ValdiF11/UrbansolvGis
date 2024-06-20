const express = require("express");
const RouteController = require("../Controllers/RouteController");
const authentication = require("../middlewares/authenticate");
const authorization = require("../middlewares/authorization");
const router = express.Router();

router.post("/addRoute", authentication, RouteController.createRoute);
router.get("/getRoutes", authentication, RouteController.getRoutes);
router.delete("/deleteRoute/:id", authentication, authorization, RouteController.deleteRoute);

module.exports = router;
