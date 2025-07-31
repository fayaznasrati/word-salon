'use strict';

module.exports = {
  useTransaction: false, // 👈 This must be inside the exported object

  async up(queryInterface, Sequelize) {
    // Create enum type first
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_event_attendances_status" AS ENUM (
        'REGISTERED', 
        'ATTENDED', 
        'CANCELLED', 
        'NO_SHOW'
      );
    `);

    await queryInterface.createTable('event_attendances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: '"enum_event_attendances_status"',
        defaultValue: 'REGISTERED',
        allowNull: false
      },
      checkInTime: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      checkOutTime: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)')
      },
      updatedAt: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      deletedAt: {
        type: Sequelize.DATE(6),
        allowNull: true
      }
    });

    // Add optimized indexes
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY event_attendance_user_event 
      ON event_attendances ("userId", "eventId") 
      WHERE "deletedAt" IS NULL;
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY event_attendance_status 
      ON event_attendances (status) 
      WHERE status != 'REGISTERED';
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX CONCURRENTLY event_attendance_checkin 
      ON event_attendances ("checkInTime") 
      WHERE "checkInTime" IS NOT NULL;
    `);

    // Add constraint for valid check-in/out times
    await queryInterface.sequelize.query(`
      ALTER TABLE event_attendances 
      ADD CONSTRAINT valid_checkout_time 
      CHECK (
        ("checkOutTime" IS NULL) OR 
        ("checkInTime" IS NOT NULL AND "checkOutTime" > "checkInTime")
      );
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS event_attendance_user_event;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS event_attendance_status;
    `);
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS event_attendance_checkin;
    `);
    await queryInterface.dropTable('event_attendances');
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_event_attendances_status";
    `);
  }
};
