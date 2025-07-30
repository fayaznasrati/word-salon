import dotenv from "dotenv";
import Logging from "../../../models/logging.model.js";
import { Op } from "sequelize";

dotenv.config();

export const getLogs = async (req, res) => {
  try {
    const paginationSize = req.query.page?.size ? +req.query.page.size : null;
    const pageNumber = req.query.page?.number ? +req.query.page.number : 1;
    const offset = paginationSize ? (pageNumber - 1) * paginationSize : null;

    const filters = req.query.filter || {};
    const sortValue = req.query.sort || null;

    const logs = await Logging.findAll({
      where: filters,
      limit: paginationSize,
      offset,
      order: sortValue ? [[sortValue, "ASC"]] : null,
    });

    const data = logs.map((log) => ({
      type: "logs",
      id: log.id,
      attributes: log,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getLog = async (req, res) => {
  try {
    const logId = req.params.id;

    const log = await Logging.findByPk(logId);

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    const data = {
      type: "logs",
      id: log.id,
      attributes: log,
    };

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createLog = async (req, res) => {
  try {
    const { agency_id, user_id, action, table_name, record_id } =
      req.body;

    if (!agency_id || !user_id || !action || !table_name || !record_id) {
      return res
        .status(400)
        .json({ errors: [{ detail: "All required fields must be provided" }] });
    }

    const newLog = await Logging.create({
      agency_id,
      user_id,
      action,
      table_name,
      record_id,
      timestamp: new Date(),
    });

    return res.status(201).json({
      data: {
        type: "logs",
        id: newLog.id,
        attributes: newLog,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const editLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const { action, table_name, record_id } = req.body.data.attributes;

    const log = await Logging.findByPk(logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    await Logging.update(
      { action, table_name, record_id },
      { where: { id: logId } }
    );

    return res.status(200).json({
      data: {
        type: "logs",
        id: logId,
        attributes: { action, table_name, record_id },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const logId = req.params.id;

    const log = await Logging.findByPk(logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    await Logging.destroy({ where: { id: logId } });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
