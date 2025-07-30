'use strict';

const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash("secretPassword", 10);
    await queryInterface.bulkDelete("agents", null, {});
    // Retrieve an existing city ID from the `cities` table
    const cities = await queryInterface.sequelize.query(
      `SELECT id FROM cities LIMIT 1;`
    );

    const cityId = cities[0][0]?.id || uuidv4(); // Use retrieved city ID or generate a random UUID if no city exists

    await queryInterface.bulkInsert("agents", [
      {
        id: uuidv4(), // Generate a UUID for the agent
        full_name: "John Doe",
        dari_full_name: "جان دو",
        phone: "0700123456",
        email: "john@example.com",
        NID: "123456789",
        NID_photo: null,
        city_id: cityId, // Use the retrieved or generated city ID
        address: "Kabul, Afghanistan",
        password: hashedPassword,
        wallet: 10000.0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("agents", null, {});
  },
};
