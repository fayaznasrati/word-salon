import { DataTypes } from "sequelize";
import sequelize from '../src/sequelize/index.js';

const Invitation = sequelize.define('Invitation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE'),
        defaultValue: 'PENDING',
        validate: {
            isIn: [['PENDING', 'ACCEPTED', 'DECLINED', 'MAYBE']]
        }
    },
    responseDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: true
        }
    },
    responseToken: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true // Only populated for email invitations
    },
    tokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    paranoid: true, // Adds deletedAt for soft deletion
    indexes: [
        {
            fields: ['userId', 'eventId'],
            unique: true
        },
        {
            fields: ['responseToken'],
            unique: true
        }
    ]
});
// ======================
// ASSOCIATIONS
// ======================
Invitation.associate = function (models) {
    console.log('Invitation associate models on user.model:', Object.keys(models));
    if (!models.User) throw new Error('User model not found');
    if (!models.Event) throw new Error('Event model not found');

    Invitation.belongsTo(models.Event, {
        foreignKey: 'eventId',
        as: 'event'
    });

    Invitation.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
    });
};

export default Invitation;