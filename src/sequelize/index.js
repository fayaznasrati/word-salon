import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  replication: {
    read: [
      {
        host: process.env.READ_DB_HOST,
        username: process.env.READ_DB_USER,
        password: process.env.READ_DB_PASSWORD,
      },
    ],
    write: {
      host: process.env.WRITE_DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
  },
  pool: {
    max: 20,
    idle: 30000,
  },
  logging: false,
});

export const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to PostgreSQL Write DB: ${process.env.WRITE_DB_HOST} and Read DB: ${process.env.READ_DB_HOST}(with replication)`);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

export default sequelize;
