const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

require("dotenv").config();

const transcribeRouter = require("./routes/transcribe");
const respondRouter = require("./routes/respond");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger("dev"));

app.use("/", transcribeRouter);
app.use("/", respondRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
