const express = require("express");
const urlencoded = require("body-parser").urlencoded;
const cookieParser = require("cookie-parser");

require("dotenv").config();

const transcribeRouter = require("./routes/transcribe");
const respondRouter = require("./routes/respond");

const app = express();
const port = 3000;

// Parse incoming POST params with Express middleware
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", transcribeRouter);
app.use("/", respondRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
