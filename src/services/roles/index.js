import dotenv from "dotenv";
import Role from "../../../models/role.model.js";
import Permission from "../../../models/permission.model.js";

dotenv.config();

export const createRoleForUser = async (obj) => {
  return await models.ModelHasRole.create(obj);
};

export const findRoleOfUser = async (whereClause) => {
  return await models.ModelHasRole(whereClause);
};

export const getRolesRoute = async (req, res) => {
  try {
    let rolesObjectArray = [];

    // Include
    let options = [];
    if (req.query.include) {
      options = req.query.include.split(",");
    }

    // Pagination
    let paginationSize = null;
    let pageNumber = null;
    if (req.query.page) {
      if (req.query.page.number) {
        pageNumber = +req.query.page.number;
      }
      if (req.query.page.size) {
        paginationSize = +req.query.page.size;
      }
    }

    // Filtering
    let filters = {};
    if (req.query.filter) {
      filters = req.query.filter;
    }

    // Sorting
    let sortValue;
    if (req.query.sort) {
      sortValue = req.query.sort;
    }

    // Choose fields
    let fieldsRoles;
    let fieldsPerms;
    if (req.query.fields) {
      if (req.query.fields.roles) {
        fieldsRoles = req.query.fields.roles.split(",");
      }
      if (req.query.fields.permissions) {
        fieldsPerms = req.query.fields.permissions.split(",");
      }
    }

    const allRoles = await Role.findAll({
      where: filters,
      attributes: fieldsRoles,
      limit: paginationSize,
      offset: (pageNumber - 1) * paginationSize,
      order: sortValue ? [[sortValue, "ASC"]] : undefined,
    });

    rolesObjectArray = allRoles.map((element) => {
      return {
        type: "roles",
        id: element.id,
        attributes: element,
      };
    });

    let includedDataPermissions = [];
    if (options.length > 0) {
      if (options.find((el) => el === "permissions")) {
        const permissions = await Permission.findAll({ attributes: fieldsPerms });
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
      data: rolesObjectArray,
      included: includedDataPermissions,
    };
    return res.status(200).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRoleRoute = async (req, res) => {
  try {
    let options = [];
    if (req.query.include) {
      options = req.query.include.split(",");
    }

    let fieldsRoles;
    let fieldsPerms;
    if (req.query.fields) {
      if (req.query.fields.roles) {
        fieldsRoles = req.query.fields.roles.split(",");
      }
      if (req.query.fields.permissions) {
        fieldsPerms = req.query.fields.permissions.split(",");
      }
    }

    const role = await Role.findByPk(req.params.id, {
      include: [
        {
          model: Permission,
          as: "permissions",
          attributes: fieldsPerms,
        },
      ],
      attributes: fieldsRoles,
    });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const sentData = {
      data: {
        type: "roles",
        id: role.id,
        attributes: role,
      },
      included: role.permissions ? role.permissions.map((perm) => ({
        type: "permissions",
        id: perm.id,
        attributes: perm,
      })) : [],
    };

    return res.status(200).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createRoleRoute = async (req, res) => {
  try {
    const { name } = req.body.data.attributes;
    if (!name) {
      return res.status(400).json({ errors: [{ detail: "Name is required" }] });
    }

    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ errors: [{ detail: "The name is already taken" }] });
    }

    const newRole = await Role.create({
      name,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const sentData = {
      data: {
        type: "roles",
        id: newRole.id,
        attributes: newRole,
      },
    };

    return res.status(201).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const editRoleRoute = async (req, res) => {
  try {
    const { name } = req.body.data.attributes;
    const roleId = req.params.id;

    if (!name) {
      return res.status(400).send({ errors: [{ detail: "The name is required" }] });
    }

    const foundRole = await Role.findByPk(roleId);
    if (!foundRole) {
      return res.status(404).json({ errors: [{ detail: "No role was found" }] });
    }

    const existingRolesWithName = await Role.findAll({
      where: {
        name,
        id: { [Op.ne]: roleId },
      },
    });

    if (existingRolesWithName.length > 0) {
      return res.status(400).send({ errors: [{ detail: "Already exists a role with this name" }] });
    }

    await Role.update(
      { name, updated_at: new Date() },
      { where: { id: roleId } }
    );

    const sentData = {
      data: {
        type: "roles",
        id: roleId,
        attributes: {
          name,
          updated_at: new Date(),
        },
      },
    };

    return res.status(200).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteRoleRoute = async (req, res) => {
  try {
    const toDeleteRole = await Role.findByPk(req.params.id, {
      include: [{
        model: User,
        as: "users",
      }],
    });

    if (toDeleteRole && toDeleteRole.users && toDeleteRole.users.length > 0) {
      return res.status(400).json({
        errors: [{ title: "The role has users attached and cannot be deleted" }],
      });
    }

    await Role.destroy({ where: { id: req.params.id } });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};