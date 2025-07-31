'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invitations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      eventId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
      },
      invitedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'DECLINED'),
        defaultValue: 'PENDING',
      },
      responseToken: {
        type: Sequelize.STRING,
        unique: false, // We'll create a partial index below
      },
      tokenExpires: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });

    // ✅ Partial unique index (no NOW() in WHERE clause)
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY invitations_token_unique 
      ON invitations ("responseToken") 
      WHERE "responseToken" IS NOT NULL;
    `);

    // ✅ Constraint: validate token expiry logic
    await queryInterface.sequelize.query(`
      ALTER TABLE invitations 
      ADD CONSTRAINT valid_token_expiry 
      CHECK (
        ("responseToken" IS NULL AND "tokenExpires" IS NULL) OR
        ("responseToken" IS NOT NULL AND "tokenExpires" > CURRENT_TIMESTAMP)
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    // Drop constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE invitations 
      DROP CONSTRAINT IF EXISTS valid_token_expiry;
    `);

    // Drop partial index
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS invitations_token_unique;
    `);

    // Drop ENUM
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_invitations_status";
    `);

    // Drop table
    await queryInterface.dropTable('invitations');
  },
};
module.exports.useTransaction = false;