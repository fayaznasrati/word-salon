'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Speaker extends Model {
    static associate(models) {
      // define association here later (e.g., with events)
    }
  }

  Speaker.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      bio: DataTypes.TEXT,
      photo_url: DataTypes.TEXT,
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: DataTypes.STRING(20),
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'speaker',
      tableName: 'speakers',
      underscored: true,
    }
  );

  return Speaker;
};
