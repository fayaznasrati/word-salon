import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";
import { dirname } from "path";
import * as fs from "fs";
import routes from "./routes/index.js";
import sequelize from "../config/connection.js"; // Updated: Sequelize connection file
import path from "path";
import { ExtractJwt } from "passport-jwt";
import passportJWT from "passport-jwt";
import passport from "passport";
import cron from "node-cron";
// import ReseedAction from "./sequelize/RessedAction.js"; // Updated: Ensure this file is adapted to Sequelize

const JWTStrategy = passportJWT.Strategy;

dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());

const whitelist = [process.env.APP_URL_CLIENT];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Connect to PostgreSQL using Sequelize
sequelize
  .authenticate()
  .then(() => console.log("PostgreSQL database connected!"))
  .catch((err) => console.error("Unable to connect to the database:", err));

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));

app.get("/", function (req, res) {
  const __dirname = fs.realpathSync(".");
  res.sendFile(path.join(__dirname, "/src/landing/index.html"));
});
app.use("/api/v1", routes);


if (process.env.SCHEDULE_HOUR) {
  cron.schedule(`0 */${process.env.SCHEDULE_HOUR} * * *`, () => {
    // ReseedAction(); // Ensure this function is refactored to use Sequelize models
  });
}

app.listen(PORT, () =>
  console.log(`Server listening to port http://localhost:${PORT}`)
);
