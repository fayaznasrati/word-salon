import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import "./passport.js";
import { dirname } from "path";
import * as fs from "fs";
import routes from "./routes/index.js";
import sequelize from "./sequelize/index.js"; // Updated: Sequelize connection file
import path from "path";
import { ExtractJwt } from "passport-jwt";
import passportJWT from "passport-jwt";
import passport from "passport";
import cron from "node-cron";

const JWTStrategy = passportJWT.Strategy;


dotenv.config();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use(passport.initialize());
// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
const whitelist = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.APP_URL_CLIENT, // Keep this if you're using env
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// Connect to PostgreSQL using Sequelize
sequelize
  .authenticate()
  .then(() => console.log(`✅ Connected to PostgreSQL Write DB: ${process.env.WRITE_DB_HOST} and Read DB: ${process.env.READ_DB_HOST}(with replication)`))
  .catch((err) => console.error("Unable to connect to the database:", err));

app.use(cors(corsOptions));
app.use(bodyParser.json({ type: "application/vnd.api+json", strict: false }));

app.get("/", function (req, res) {
  const __dirname = fs.realpathSync(".");
  res.sendFile(path.join(__dirname, "/src/landing/index.html"));
});
app.use("/api/v1", routes);



app.listen(PORT, () =>
  console.log(`Server listening to port http://localhost:${PORT}`)
);
