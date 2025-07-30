"use strict";
import { DataTypes, Model } from "sequelize";
import sequelize from "../src/sequelize/index.js"; 

class Logging extends Model {}

Logging.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agency_id: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable if not tied to an agency
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Nullable for system-level actions
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    table_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    record_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Logging",
    tableName: "loggings",
    timestamps: true,
    paranoid: true, // Enables soft deletion (uses `deleted_at` column)
  }
);

export default Logging;
