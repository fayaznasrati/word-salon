import { DataTypes, Op, } from "sequelize";
import sequelize from "../src/sequelize/index.js";

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    validate: {
      len: [2, 50]
    }
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    }
  },
  photo_url: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+?[\d\s-]{10,}$/i
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true, // Enables soft deletion
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['email'],
      unique: true
    },
    {
      fields: ['phone'],
      unique: true,
      where: {
        phone: {
          [Op.ne]: null
        }
      }
    },
    {
      fields: ['created_at']
    }
  ],
  defaultScope: {
    attributes: {
      exclude: ['password_hash', 'deleted_at']
    }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password_hash'] }
    },
    withDeleted: {
      paranoid: false
    },
    active: {
      where: {
        deleted_at: null
      }
    }
  }
});

// ======================
// ASSOCIATIONS
// ======================
User.associate = (models) => {
  // console.log('User associate models on user.model:', Object.keys(models));

  if (!models.User) throw new Error('User model not found');
  if (!models.Event) throw new Error('Event model not found');
  if (!models.Invitation) throw new Error('Invitation model not found');

  User.hasMany(models.Event, {
    foreignKey: 'createdBy',
    as: 'organized_events',
    onDelete: 'CASCADE'
  });

  User.belongsToMany(models.Event, {
    through: models.Invitation,
    foreignKey: 'userId',
    as: 'invited_events',
    onDelete: 'CASCADE'
  });

  User.hasMany(models.Invitation, {
    foreignKey: 'userId',
    as: 'invitations',
    onDelete: 'CASCADE'
  });

  // You can comment this if `event_attendance` model doesn't exist yet
  // User.hasMany(models.event_attendance, {
  //   foreignKey: 'userId',
  //   as: 'attendances'
  // });
};


// ======================
// INSTANCE METHODS
// ======================
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.deleted_at;
  return values;
};

User.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

export default User;