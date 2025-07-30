"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("permissions", [
      {
        id: uuidv4(),
        name: "Create User",
        description: "Allows creating new users",
      },
      {
        id: uuidv4(),
        name: "Edit User",
        description: "Allows editing users",
      },
      {
        id: uuidv4(),
        name: "Delete User",
        description: "Allows deleting users",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};
