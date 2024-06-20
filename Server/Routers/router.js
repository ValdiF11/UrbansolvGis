const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to server!");
});

router.use("/user", require("./user"));
router.use("/map", require("./routeMap"));

module.exports = router;
