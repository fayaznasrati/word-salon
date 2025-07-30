"use strict";
const { v4: uuidv4 } = require("uuid");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles LIMIT 1;`
    );
    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissions;`
    );

    const roleId = roles[0][0]?.id;
    const permissionIds = permissions[0].map((perm) => perm.id);

    if (roleId && permissionIds.length > 0) {
      await queryInterface.bulkInsert("role_permissions", [
        {
           id: uuidv4(),
          role_id: roleId,
          permission_id: permissionIds[0],
        },
        {
          id: uuidv4(),
          role_id: roleId,
          permission_id: permissionIds[1],
        },
      ]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};
