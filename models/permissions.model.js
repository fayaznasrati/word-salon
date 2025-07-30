import { DataTypes } from "sequelize";
import sequelize from "../src/sequelize/index.js"; 

const Permissions = sequelize.define(
  "Permissions",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "permissions",
    timestamps: false,
  }
);

export default Permissions;
