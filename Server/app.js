require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./Routers/router");
const errorHandler = require("./middlewares/errorHandler");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(router);
router.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
