import { DataTypes, Op, } from "sequelize";
import sequelize from '../src/sequelize/index.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000]
    }
  },
  startDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: {
        args: new Date().toISOString(),
        msg: 'Start date must be in the future'
      }
    }
  },
  endDateTime: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfter: function (value) {
        if (value <= this.startDateTime) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  zoomLink: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  status: {
    type:  DataTypes.STRING,
    defaultValue: 'UPCOMING'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'events', // explicitly set the table name
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ['startDateTime']
    },
    {
      fields: ['status']
    }
  ],
  hooks: {
    beforeSave: (event) => {
      // Auto-update status based on dates
      const now = new Date();
      if (event.startDateTime > now) {
        event.status = 'UPCOMING';
      } else if (event.endDateTime < now) {
        event.status = 'COMPLETED';
      } else {
        event.status = 'ONGOING';
      }
    }
  }
});

// ======================
// ASSOCIATIONS
// ======================
Event.associate = function (models) {
  // console.log('event associate models on Event.model:', Object.keys(models));

  if (!models.User) throw new Error('User model not found');
  if (!models.Invitation) throw new Error('Invitation model not found');

  Event.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'organizer'
  });

  Event.hasMany(models.Invitation, {
    foreignKey: 'eventId',
    as: 'invitations'
  });

  Event.belongsToMany(models.User, {
    through: models.Invitation,
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'attendees'
  });
};

export default Event;