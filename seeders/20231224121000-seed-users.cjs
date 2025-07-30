"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("SuperStrongPassword123!", salt);

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(), // Generate a UUID
        name: "Fayaz Nasrati",
        email: "fayaz.nasraty@world-salon.com",
        password: hashedPassword,
        profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(), // Generate a UUID
        name: "Super Admin",
        email: "superadmin@world-salon.com",
        password: hashedPassword,
        profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(), // Generate a UUID
        name: "Creator",
        email: "creator@world-salon.com",
        password: hashedPassword,
        profile_image: `${process.env.APP_URL_API}/public/images/creator.jpg`,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(), // Generate a UUID
        name: "Member",
        email: "member@world-salon.com",
        password: hashedPassword,
        profile_image: `${process.env.APP_URL_API}/public/images/member.jpg`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", null, {});
  },
};
