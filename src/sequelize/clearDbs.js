import sequelize from "./index.js";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import Permission from "../models/permission.model.js";
import Tag from "../models/tag.model.js";
import Category from "../models/category.model.js";
import Item from "../models/item.model.js";

async function clear() {
  await sequelize.sync(); // Ensures all models are synchronized
  await Role.destroy({ truncate: true, cascade: true });
  await Permission.destroy({ truncate: true, cascade: true });
  await User.destroy({ truncate: true, cascade: true });
  await Tag.destroy({ truncate: true, cascade: true });
  await Category.destroy({ truncate: true, cascade: true });
  await Item.destroy({ truncate: true, cascade: true });
  console.log("DB cleared");
}

clear().then(() => {
  sequelize.close();
});
