import auth from "./authentication.js";
import {alert} from "./popups.js";

/**
 * @typedef {Object} RecordOptions
 * @property {number?} limit - The number of records to return
 * @property {number?} page - The page number to return
 * @property {string?} sort - The field to sort by
 * @property {boolean?} asc - Whether to sort in ascending order
 */

/**
 * @typedef {Object} HistoryRecord
 * @property {string} location_id - The id of the location the record is associated with
 * @property {string} record_id - The id of the record the history is associated with
 * @property {ActionType} action_type - The type of action that was performed
 * @property {string} user - The user that performed the action
 * @property {Object} data - The data that was affected by the action
 * @property {Date} timestamp - The time the action was performed
 * @property {string} id - The id of the history record
 */


/**
 * Represents action type for history records.
 * @typedef {Object} ActionType
 * @property {number} CREATE - When creating a database, table or record.
 * @property {number} UPDATE - When updating a database, table or record.
 * @property {number} DELETE - When deleting a database, table or record.
 */
const ActionType = {
    CREATE: 0,
    UPDATE: 1,
    DELETE: 2,
}

/**
 * Returns the corresponding string representation for the given action type.
 *
 * @param {string} actionType - The action type.
 * @return {string} - The string representation of the action type.
 */
function getActionTypeString(actionType) {
    switch (actionType) {
        case ActionType.CREATE:
            return "Create"
        case ActionType.UPDATE:
            return "Update"
        case ActionType.DELETE:
            return "Delete"
        default:
            return "Unknown"
    }
}

/**
 * Converts a string representation of an action type to its corresponding ActionType enum value.
 *
 * @param {string} actionType - The string representation of the action type.
 * @return {number} - The ActionType enum value corresponding to the given string. Returns -1 if no match is found.
 */
function getActionTypeFromString(actionType) {
    switch (actionType) {
        case "Create":
            return ActionType.CREATE
        case "Update":
            return ActionType.UPDATE
        case "Delete":
            return ActionType.DELETE
        default:
            return -1
    }
}

/**
 * Returns the action type based on the given integer value.
 *
 * @param {number} actionType - The integer representing the action type.
 * @return {ActionType} - The corresponding action type as a string.
 */
function getActionTypeFromInt(actionType) {
    switch (actionType) {
        case 0:
            return ActionType.CREATE
        case 2:
            return ActionType.DELETE
        case 1:
        default:
            return ActionType.UPDATE
    }
}


/**
 * Retrieves the history of records from the server.
 *
 * @param {string} [location_id=""] - The id of the location to retrieve history from.
 * @param {string} [record_id=""] - The id of the specific record to retrieve history for.
 * @param {RecordOptions} [record_options={}] - Additional options to filter or sort the history.
 *
 * @return {Promise<HistoryRecord[]>} - A promise that resolves with the history records retrieved from the server.
 * If there is an error, the promise is rejected with an error message.
 */
async function getHistory(location_id = "", record_id = "", record_options = {}) {
    const url = new URL(`${baseURL}/api/history`)
    if (location_id) {
        url.href += `/${location_id}`
        if (record_id) url.href += `/${record_id}`
    }
    if (record_options.limit) url.searchParams.append("limit", record_options.limit.toString())
    if (record_options.page) url.searchParams.append("page", record_options.page.toString())
    if (record_options.sort) url.searchParams.append("sort", record_options.sort)
    if (record_options.asc) url.searchParams.append("asc", record_options.asc.toString())
    try {
        /**
         * @type {Object}
         */
        const response = await $.get(url.href);
        return response.map(parseJSONToHistoryRecord);
    } catch (e) {
        console.error(e)
        alert(`Unable to get history from the server!`);
    }
}

/**
 * Adds a history record to the server.
 *
 * @param {string} location_id - The ID of the location.
 * @param {string} record_id - The ID of the record.
 * @param {ActionType} action - The type of the action.
 * @param {Object} data - The data associated with the action.
 * @return {Promise<Object|null>} - A Promise that resolves with the server response if successful, or rejects with an error if unsuccessful.
 */
async function addHistory(location_id, record_id, action, data) {
    const url = `${baseURL}/api/history/`
    try {
        return await $.post({
            url: url,
            data: {
                location_id: location_id,
                record_id: record_id,
                action_type: action,
                user: auth.isLoggedIn ? auth.getUserProfile().username : "NoAuthUser",
                data: data
            }
        });
    } catch (e) {
        console.error(e)
        alert(`Unable to add history to the server!`);
    }

    return null;
}

/**
 * Parses JSON object to a history record.
 *
 * @param {Object} json - The JSON object representing the history record.
 * @return {HistoryRecord} - The parsed history record.
 */
function parseJSONToHistoryRecord(json) {
    const record = json;
    record.timestamp = new Date(record.timestamp);
    record.action_type = getActionTypeFromInt(parseInt(record.action_type.toString()));
    return record;
}


export {getHistory, addHistory, ActionType, parseJSONToHistoryRecord, getActionTypeString, getActionTypeFromString, getActionTypeFromInt}