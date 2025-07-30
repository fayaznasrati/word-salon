import Permission from "../../../models/permission.model.js";

export const getPermissionsRoute = async (req, res) => {
  try {
    let permissionsObjectArray = [];

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

    // Choose fields
    let fieldsPerms;
    if (req.query.fields) {
      if (req.query.fields.permissions) {
        fieldsPerms = req.query.fields.permissions.split(",");
      }
    }

    const allPermissions = await Permission.findAll({
      attributes: fieldsPerms,
      limit: paginationSize,
      offset: (pageNumber - 1) * paginationSize,
    });

    permissionsObjectArray = allPermissions.map((element) => {
      return {
        type: "permissions",
        id: element.id,
        attributes: element,
      };
    });

    const sentData = { data: permissionsObjectArray };
    return res.status(200).send(sentData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
