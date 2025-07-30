import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../../../models/user.model.js";
import Role from "../../../models/role.model.js";
import Permission from "../../../models/permission.model.js";
import { Op } from "sequelize";

dotenv.config();

const validateEmail = (inputText) => {
  var mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return mailformat.test(inputText);
};

export const getUsersRoute = async (req, res) => {
  try {
    const options = req.query.include ? req.query.include.split(",") : [];

    const paginationSize = req.query.page?.size ? +req.query.page.size : null;
    const pageNumber = req.query.page?.number ? +req.query.page.number : 1;
    const offset = paginationSize ? (pageNumber - 1) * paginationSize : null;

    const filters = req.query.filter || {};
    const sortValue = req.query.sort || null;

    const fieldsUser = req.query.fields?.users?.split(",") || null;
    const fieldsRole = req.query.fields?.roles?.split(",") || null;

    const users = await User.findAll({
      where: filters,
      attributes: fieldsUser,
      limit: paginationSize,
      offset,
      order: sortValue ? [[sortValue, "ASC"]] : null,
      include: options.includes("roles")
        ? [{ model: Role, as: "roleDetail", attributes: fieldsRole }]
        : null,
    });

    const data = users.map((user) => {
      const userObj = {
        type: "users",
        id: user.id,
        attributes: user,
      };
      if (options.includes("roles")) {
        userObj.relationships = {
          roles: {
            data: {
              type: "roles",
              id: user.roleDetail?.id,
            },
          },
        };
      }
      return userObj;
    });

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getUserRoute = async (req, res) => {
  try {
    const userId = req.params.id;
    const options = req.query.include ? req.query.include.split(",") : [];

    const fieldsUser = req.query.fields?.users?.split(",") || null;
    const fieldsRole = req.query.fields?.roles?.split(",") || null;

    const user = await User.findByPk(userId, {
      attributes: fieldsUser,
      include: options.includes("roles")
        ? [{ model: Role, as: "roleDetail", attributes: fieldsRole }]
        : null,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const data = {
      type: "users",
      id: user.id,
      attributes: user,
      relationships: options.includes("roles")
        ? {
            roles: {
              data: {
                type: "roles",
                id: user.roleDetail?.id,
              },
            },
          }
        : null,
    };

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createUserRoute = async (req, res) => {
  try {
    const {
      name,
      email,
      profile_image,
      password,
      password_confirmation,
    } = req.body.data.attributes;
    const roleId = req.body.data.relationships.roles.data[0].id;

    if (!name || !email || !password || !roleId) {
      return res
        .status(400)
        .json({ errors: [{ detail: "All required fields must be provided" }] });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ errors: [{ detail: "Invalid email format" }] });
    }

    if (password !== password_confirmation) {
      return res
        .status(400)
        .json({ errors: [{ detail: "Passwords do not match" }] });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ errors: [{ detail: "Email already in use" }] });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profile_image,
      role: roleId,
    });

    return res.status(201).json({
      data: {
        type: "users",
        id: newUser.id,
        attributes: newUser,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const editUserRoute = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, profile_image } = req.body.data.attributes;
    const roleId = req.body.data.relationships?.roles?.data[0]?.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingUserWithEmail = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: userId },
      },
    });
    if (existingUserWithEmail) {
      return res
        .status(400)
        .json({ errors: [{ detail: "Email already in use" }] });
    }

    await User.update(
      { name, email, profile_image, role: roleId },
      { where: { id: userId } }
    );

    return res.status(200).json({
      data: {
        type: "users",
        id: userId,
        attributes: { name, email, profile_image },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteUserRoute = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.destroy({ where: { id: userId } });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
