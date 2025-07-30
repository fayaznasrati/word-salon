import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role from "../../../models/role.model.js";
import Permission from "../../../models/permission.model.js";
import User from "../../../models/user.model.js";

export const getProfileRouteHandler = async (req, res) => {
  try {
    let fieldsUsers = [];
    let fieldsRoles = [];
    let fieldsPerms = [];

    if (req.query.fields) {
      if (req.query.fields.users) {
        fieldsUsers = req.query.fields.users.split(",");
      }
      if (req.query.fields.roles) {
        fieldsRoles = req.query.fields.roles.split(",");
      }
      if (req.query.fields.permissions) {
        fieldsPerms = req.query.fields.permissions.split(",");
      }
    }

    const meUser = await User.findOne({
      where: { id: req.user.id },
      attributes: fieldsUsers,
    });

    const role = await Role.findOne({
      where: { id: req.user.role },
      attributes: fieldsRoles,
    });

    const permissions = await Permission.findAll({
      where: { id: role.permissions },
      attributes: fieldsPerms,
    });

    let options = [];
    let includedDataPermissions = [];

    if (req.query.include) {
      options = req.query.include.split(",");
    }

    let objectRoles = {};

    if (options.length > 0) {
      if (options.find((el) => el === "roles")) {
        objectRoles = {
          type: "roles",
          id: role.id,
          attributes: role,
        };
      }

      if (options.find((el) => el === "roles.permissions")) {
        includedDataPermissions = permissions.map((element) => {
          return {
            type: "permissions",
            id: element.id,
            attributes: element,
          };
        });
      }
    }

    const sentData = {
      data: {
        type: "users",
        id: meUser.id,
        attributes: meUser,
      },
      included: [objectRoles, ...includedDataPermissions],
    };

    delete sentData.data.attributes.password;
    res.send(sentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const patchProfileRouteHandler = async (req, res) => {
  try {
    const currentDataOfUser = req.user;
    const { name, email } = req.body.data.attributes;
    const newPassword = req.body.data.attributes.password_new;
    const confirmPassword = req.body.data.attributes.password_confirmation;

    const foundUser = await User.findOne({ where: { email: currentDataOfUser.email } });

    if (!foundUser) {
      return res.status(400).json({ error: "No user matches the credentials" });
    }

    if ((newPassword && newPassword.length < 8) || newPassword !== confirmPassword) {
      return res.status(400).json({
        errors: {
          password: [
            "The password should have at least 8 characters and match the password confirmation.",
          ],
        },
      });
    }

    const updates = { name, email };

    if (newPassword && newPassword.length >= 8 && newPassword === confirmPassword) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    await User.update(updates, { where: { email: foundUser.email } });

    const sentData = {
      data: {
        type: "users",
        id: foundUser.id,
        attributes: {
          name,
          email,
          profile_image: foundUser.profile_image,
        },
      },
    };

    res.send(sentData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
