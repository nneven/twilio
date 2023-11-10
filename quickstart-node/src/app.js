import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "morgan";

import transcribeRouter from "./routes/transcribe.js";
import respondRouter from "./routes/respond.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(urlencoded({ extended: false }));
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
