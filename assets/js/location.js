import auth from "./authentication.js";

/**
 * Adds a record to the specified location in the database.
 *
 * @param {Object[]} records - The records to be added.
 * @return {Promise<Object>} - A promise that resolves when the operation is complete.
 */
async function addRecord(records) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/`,
        method: "POST",
        data: JSON.stringify(records),
        contentType: "application/json",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}

/**
 * Retrieves records from the server.
 *
 * @returns {Promise<Object>} A Promise that resolves with the retrieved records.
 */
async function getRecords() {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/`,
        method: "GET",
        headers: {accept: "application/json"},
    });
}

/**
 * Deletes a record with the specified id from the database.
 *
 * @param {string} id - The id of the record to be deleted.
 * @return {Promise<Object>} - A promise that resolves when the record is successfully deleted.
 */
async function deleteRecord(id) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/${id}/`,
        method: "DELETE",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}

/**
 * Updates a record with the given id and records.
 *
 * @param {number} id - The id of the record to be updated.
 * @param {object} records - The updated records data.
 * @returns {Promise<Object>} - A promise that resolves when the record is successfully updated.
 */
async function updateRecord(id, records) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/${id}/`,
        method: "POST",
        data: JSON.stringify(records),
        contentType: "application/json",
        headers: {
            accept: "application/json",
            "X-User": auth.getUserProfile().username
        },
    });
}

/**
 * Searches for records in the specified database using the provided query.
 *
 * @param {string} query - The search query.
 * @param {string[]} [columns=[]] - The columns to search within. Defaults to an empty array.
 * @param {number} [limit=10] - The maximum number of records to return. Defaults to 10.
 * @param {number} [page=0] - The page number of the results. Defaults to 0.
 * @param {string} [sort="id"] - The field to sort the results by. Defaults to "id".
 * @param {boolean} [ascending=true] - Specifies whether the results should be sorted in ascending order. Defaults to true.
 *
 * @return {Promise<Object>} - A promise that resolves with the search results.
 */
async function searchRecords(query, columns = [], limit = 10, page = 0, sort = "id", ascending = true) {
    return $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/search`,
        method: "POST",
        data: {query, columns, limit, page, sort, asc: ascending},
        headers: {accept: "application/json"},
    });
}

export {addRecord, getRecords, deleteRecord, updateRecord, searchRecords};