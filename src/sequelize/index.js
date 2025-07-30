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
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log(`✅ Connected to PostgreSQL with replication`);
  } catch (err) {
    console.error("❌ PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
};

export default sequelize;