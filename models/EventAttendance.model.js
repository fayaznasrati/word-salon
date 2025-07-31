import { DataTypes } from "sequelize";
import sequelize from "../src/sequelize/index.js";

const EventAttendance = sequelize.define('EventAttendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  status: {
    type: DataTypes.ENUM('REGISTERED', 'ATTENDED', 'CANCELLED', 'NO_SHOW'),
    defaultValue: 'REGISTERED',
    allowNull: false
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'event_attendances',
  timestamps: true,
  paranoid: true, // Enables soft deletion
  indexes: [
    {
      fields: ['userId', 'eventId'],
      unique: true
    },
    {
      fields: ['status']
    }
  ]
});

EventAttendance.associate = (models) => {
  EventAttendance.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'attendee',
    onDelete: 'CASCADE'
  });
  
  EventAttendance.belongsTo(models.Event, {
    foreignKey: 'eventId',
    as: 'event',
    onDelete: 'CASCADE'
  });
};

export default EventAttendance;