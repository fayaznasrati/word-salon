import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Agency from "../../../models/agencies.model.js";
import { Op } from "sequelize";
import { logActivity } from "../../utils/logging/index.js";

dotenv.config();

const validateEmail = (inputText) => {
  const mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return mailformat.test(inputText);
};


export const getAgencies = async (req, res) => {
  try {
    const paginationSize = req.query.page?.size ? +req.query.page.size : null;
    const pageNumber = req.query.page?.number ? +req.query.page.number : 1;
    const offset = paginationSize ? (pageNumber - 1) * paginationSize : null;

    const filters = req.query.filter || {};
    const sortValue = req.query.sort || null;

    const agencies = await Agency.findAll({
      where: filters,
      limit: paginationSize,
      offset,
      order: sortValue ? [[sortValue, "ASC"]] : null,
    });

    const data = agencies.map((agency) => ({
      type: "agencies",
      id: agency.id,
      attributes: agency,
    }));

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getAgency = async (req, res) => {
  try {
    const agencyId = req.params.id;

    const agency = await Agency.findByPk(agencyId);

    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }

    const data = {
      type: "agencies",
      id: agency.id,
      attributes: agency,
    };

    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const createAgency = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      password_confirmation,
      ...otherAttributes
    } = req.body;

    if (!name || !email || !password) {
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

    const existingAgency = await Agency.findOne({ where: { email } });
    if (existingAgency) {
      return res
        .status(400)
        .json({ errors: [{ detail: "Email already in use" }] });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAgency = await Agency.create({
      ...otherAttributes,
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      data: {
        type: "agencies",
        id: newAgency.id,
        attributes: newAgency,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const editAgency = async (req, res) => {
  try {
    const agencyId = req.params.id;
    const { name, email, ...otherAttributes } = req.body.data.attributes;

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }

    const existingAgencyWithEmail = await Agency.findOne({
      where: {
        email,
        id: { [Op.ne]: agencyId },
      },
    });

    if (existingAgencyWithEmail) {
      return res
        .status(400)
        .json({ errors: [{ detail: "Email already in use" }] });
    }

    await Agency.update(
      { name, email, ...otherAttributes },
      { where: { id: agencyId } }
    );
  // Log the activity
  await logActivity({
    agency_id: agencyId,
    user_id: req.user.id,
    action: "Update",
    table_name: "agencies",
    record_id: agencyId,
    ip_address: req.ip,
    user_role: req.user.role,
    user_agent: req.headers["user-agent"],
    action_details: { name, email, license_number }, // Include the updated details
  });
    return res.status(200).json({
      data: {
        type: "agencies",
        id: agencyId,
        attributes: { name, email, ...otherAttributes },
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const deleteAgency = async (req, res) => {
  try {
    const agencyId = req.params.id;

    const agency = await Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: "Agency not found" });
    }

    await Agency.destroy({ where: { id: agencyId } });

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


