import bcrypt from "bcrypt";
import sequelize from "./index.js";
import User from "../../models/user.model.js";
import Role from "../../models/role.model.js";
import Permission from "../../models/permission.model.js";


const ReseedAction = async () => {
  await sequelize.sync({ force: true }); // Drops and recreates all tables

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
    // Add more permissions here
  ]);

  const adminRole = await Role.create({
    name: "admin",
    users: [admin],
    permissions: permissions.map((p) => p.id), // Add proper associations
  });

  console.log("DB reseeded successfully");
};

ReseedAction();
