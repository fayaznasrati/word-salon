'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ======================
    // 1. TABLE CREATION (Sequelize)
    // ======================
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      photo_url: {
        type: Sequelize.STRING(512),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      password_hash: {
        type: Sequelize.STRING(128),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(6)')
      },
      updated_at: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE(6),
        allowNull: true
      },
      last_login_at: {
        type: Sequelize.DATE(6),
        allowNull: true
      }
    });

    // ======================
    // 2. ADVANCED INDEXES (Raw SQL)
    // ======================
await queryInterface.sequelize.query(`
  CREATE UNIQUE INDEX CONCURRENTLY users_email_lower_idx 
  ON users (LOWER(email));
`);

await queryInterface.sequelize.query(`
  CREATE UNIQUE INDEX CONCURRENTLY users_phone_unique 
  ON users (phone) 
  WHERE phone IS NOT NULL;
`);

await queryInterface.sequelize.query(`
  CREATE INDEX CONCURRENTLY users_created_at_brin 
  ON users USING BRIN (created_at);
`);

await queryInterface.sequelize.query(`
  CREATE INDEX CONCURRENTLY users_profile_cover 
  ON users (id, email) INCLUDE (name, photo_url) 
  WHERE deleted_at IS NULL;
`);


    // ======================
    // 3. CONSTRAINTS (Raw SQL)
    // ======================
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ADD CONSTRAINT password_hash_length 
      CHECK (LENGTH(password_hash) >= 60);
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS users_email_lower_idx;
      DROP INDEX CONCURRENTLY IF EXISTS users_phone_unique;
      DROP INDEX CONCURRENTLY IF EXISTS users_created_at_brin;
      DROP INDEX CONCURRENTLY IF EXISTS users_profile_cover;
      ALTER TABLE users DROP CONSTRAINT IF EXISTS password_hash_length;
    `);
    
    await queryInterface.dropTable('users');
  },

 
};
module.exports.useTransaction = false;