import Logging from "../../../models/logging.model.js";

/**
 * Utility function to log activities
 * @param {Object} params - Log parameters
 * @param {UUID} params.agency_id - ID of the agency performing the action
 * @param {UUID} params.user_id - ID of the user performing the action
 * @param {string} params.action - The CRUD action (e.g., "Create", "Update", "Delete")
 * @param {string} params.table_name - The table being affected
 * @param {UUID} params.record_id - The ID of the record being affected
 * @param {string} params.ip_address - IP address of the user performing the action
 * @param {string} params.user_role - Role of the user performing the action
 * @param {string} params.user_agent - User agent string (e.g., browser details)
 * @param {Object} params.action_details - Additional details about the action
 */
export const logActivity = async ({
  agency_id,
  user_id,
  action,
  table_name,
  record_id,
  ip_address,
  user_role,
  user_agent,
  action_details,
}) => {
  try {
    await Logging.create({
      agency_id,
      user_id,
      action,
      table_name,
      record_id,
      ip_address,
      user_role,
      user_agent,
      action_details,
    });
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};
