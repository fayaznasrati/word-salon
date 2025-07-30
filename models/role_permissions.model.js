import { DataTypes } from "sequelize";
import sequelize from "../src/sequelize/index.js"; 
import Roles from "./role.model.js"; // Ensure the Roles model exists
import Permissions from "./permissions.model.js"; // Ensure the Permissions model exists

const RolePermissions = sequelize.define(
  "RolePermissions",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Roles,
        key: "id",
      },
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Permissions,
        key: "id",
      },
    },
  },
  {
    tableName: "role_permissions",
    timestamps: false,
  }
);

export default RolePermissions;
