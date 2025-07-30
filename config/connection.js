// config/connection.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // PostgreSQL username
  process.env.DB_PASSWORD, // PostgreSQL password
  {
    host: process.env.DB_HOST || "127.0.0.1", // Default to localhost if not specified
    dialect: "postgres", // Specify PostgreSQL as the dialect
    logging: false, // Disable logging for clean output (optional)
  }
);

export default sequelize;
