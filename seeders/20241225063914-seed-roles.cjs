"use strict";
const { v4: uuidv4 } = require("uuid");
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkInsert(
      "roles",
      [
        {
          id: uuidv4(), // Generate a UUID
          name: "admin",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(), // Generate a UUID
          name: "topup",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(), // Generate a UUID
          name: "agency",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(), // Generate a UUID
          name: "agent",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
