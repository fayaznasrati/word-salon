'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {


    await queryInterface.createTable('events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      topic: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      startDateTime: {
        type: Sequelize.DATE(6), // Microsecond precision
        allowNull: false
      },
      endDateTime: {
        type: Sequelize.DATE(6),
        allowNull: false
      },
      zoomLink: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      status: {
        type:  Sequelize.STRING(20),
        defaultValue: 'UPCOMING',
        allowNull: false
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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

    // ======================
    // 2. ADVANCED INDEXES (Raw SQL)
    // ======================
await queryInterface.sequelize.query(`
  CREATE INDEX CONCURRENTLY events_temporal_idx 
  ON events USING BRIN ("startDateTime", "endDateTime");
`);

await queryInterface.sequelize.query(`
  CREATE INDEX CONCURRENTLY events_listing_cover 
  ON events (status, "startDateTime") 
  INCLUDE (id, topic, "zoomLink")
  WHERE "deletedAt" IS NULL;
`);

await queryInterface.sequelize.query(`
  CREATE INDEX CONCURRENTLY events_createdBy_idx 
  ON events ("createdBy");
`);



    // ======================
    // 3. CONSTRAINTS (Raw SQL)
    // ======================
    await queryInterface.sequelize.query(`
      -- Enforce valid time ranges
      ALTER TABLE events 
      ADD CONSTRAINT valid_event_dates 
      CHECK (
        "endDateTime" > "startDateTime" AND
        "startDateTime" > CURRENT_TIMESTAMP - INTERVAL '1 year'
      );
      
      -- Validate Zoom URL format at DB level
      ALTER TABLE events 
      ADD CONSTRAINT valid_zoom_link 
      CHECK ("zoomLink" ~* '^https://(www\\.)?zoom\\.us/');
    `);
  },

  async down(queryInterface) {
    // ======================
    // 4. ROLLBACK (Safe order)
    // ======================
    await queryInterface.sequelize.query(`
      DROP INDEX CONCURRENTLY IF EXISTS events_temporal_idx;
      DROP INDEX CONCURRENTLY IF EXISTS events_listing_cover;
      DROP INDEX CONCURRENTLY IF EXISTS events_createdBy_idx;
      ALTER TABLE events DROP CONSTRAINT IF EXISTS valid_event_dates;
      ALTER TABLE events DROP CONSTRAINT IF EXISTS valid_zoom_link;
    `);
    
    await queryInterface.dropTable('events');
    await queryInterface.sequelize.query('DROP TYPE "enum_events_status" CASCADE');
  }
};