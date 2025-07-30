// seedData.js
import bcrypt from "bcrypt";
import sequelize from "./index.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";
import Tag from "../models/tag.model.js";
import Category from "../models/category.model.js";
import Item from "../models/item.model.js";

const seedDB = async () => {
  await sequelize.sync({ force: true }); // Resets database

  const hashedPassword = await bcrypt.hash("secret", 10);

  const admin = await User.create({
    name: "Admin",
    email: "admin@jsonapi.com",
    password: hashedPassword,
    profile_image: `${process.env.APP_URL_API}/public/images/admin.jpg`,
  });

  const permissions = await Permission.bulkCreate([
    { name: "view users" },
    { name: "create users" },
    { name: "edit users" },
    { name: "delete users" },
  ]);

  const adminRole = await Role.create({
    name: "admin",
  });

  await adminRole.addUser(admin);
  await adminRole.addPermissions(permissions);

  console.log("Database seeded successfully");
};

seedDB().then(() => {
  sequelize.close();
});
