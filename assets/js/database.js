/**
 * A "Enum" for the different types of lists.
 */
const listTypes = {
    /**
     * The main list of locations.
     */
    directory: 0,
    /**
     * The list for a specific location
     */
    location: 1,
    /**
     * The voice search for a specific location
     */
    voice: 2,
};

/**
 * Represents a database object.
 * @class
 */
class Database {
    /**
     * Constructs a new Database object.
     * Initializes the total_items property to 0 and calls the resetURLParameters method.
     * @constructor
     */
    constructor() {
        this.total_items = 0;
        this.data = {};
        this.options = {};
        this.listData = {};
        this.columns = [];
        this.resetURLParameters();
    }

    /**
     * Searches the database for items matching the given query.
     * @param {string} query - The search query.
     * @returns {Promise} - A promise that resolves with the search results.
     */
    async search(query) {
        return await this.load(this.limit, 0, this.sort, this.ascending, query, this.list);
    }

    async loadList(list) {
        return await this.load(this.limit, 0, "id", true, "", list);
    }

    /**
     * Sorts the list by the given column.
     * @param {string} sort The sort column
     * @param {boolean} ascending If the sort should be ascending or descending
     */
    async sortList(sort, ascending) {
        return await this.load(this.limit, 0, sort, ascending, this.keyword, this.list);
    }

    /**
     * Loads data from the database.
     * @param {number} [limit=10] - The maximum number of items to load.
     * @param {number} [page=0] - The page number to load.
     * @param {string} [sort="id"] - The field to sort the data by.
     * @param {boolean} [ascending=true] - Whether to sort the data in ascending order.
     * @param {string} [keyword=""] - The keyword to search for.
     * @param {string} [list=""] - The list ID to filter the data by.
     * @returns {Promise} - A promise that resolves with the loaded data.
     */
    async load(limit = 10, page = 0, sort = "id", ascending = true, keyword = "", list = "") {
        // Assign the 'list' parameter to the 'this.list' property of the current object.
        this.list = list;

        // Assign the 'sort' parameter to the 'this.sort' property of the current object.
        this.sort = sort;

        // Assign the 'ascending' parameter to the 'this.ascending' property of the current object.
        this.ascending = ascending;

        // Assign the 'page' parameter to the 'this.page' property of the current object.
        this.page = page;

        // Assign the 'limit' parameter to the 'this.limit' property of the current object.
        this.limit = limit;

        // Assign the 'keyword' parameter to the 'this.keyword' property of the current object.
        this.keyword = keyword;

        // Call the 'updateURLParameters' method of the current object.
        this.updateURLParameters();

        if (this.list != "") {
            this.listData = await this.loadListData();
            try {
                this.options = JSON.parse(this.listData.options);
            } catch {
                this.options = {};
            }
        } else {
            this.options = {};
        }

        // Construct the URL for the AJAX request. The URL is constructed based on the parameters passed.
        let url = `/api/location${list == "" ? "s" : ""}.php?limit=${limit}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&query=" + keyword}${list == "" ? "" : "&id=" + list}`;

        // Make an AJAX request to the constructed URL.
        return await $.ajax({
            // The URL to which the request is made.
            url: url,

            // The HTTP method for the request.
            type: "GET",

            // The function to be called if the request succeeds.
            success: (data) => {
                if (data.error) {
                    console.error(data.error);
                    alert(data.error);
                    return;
                }
                // Assign the length of the 'items' array in the response data to the 'this.total_items' property of the current object.
                this.total_items = data.items.length;
                this.data = data;
                // Trigger the 'load' event on the current object, passing the response data as an argument.
                $(this).trigger("loaded", [
                    {
                        type: list == "" ? listTypes.directory : listTypes.location,
                        data: data,
                    },
                ]);

                // Return the response data.
                return data;
            },

            // The function to be called if the request fails.
            error: (data) => {
                // Log the error data to the console.
                console.error(`Error loading data: ${JSON.stringify(data)}}`);
                this.resetURLParameters();
                this.updateURLParameters();
                let conf = confirm("An error occurred while loading the data. Would you like to reload?");
                if (conf) {
                    window.location.reload();
                }

                // Return the error data.
                return data;
            },
        });
    }

    /**
     * Loads the options for the loaded list.
     * @returns {Promise} - A promise that resolves with the options for the main list.
     */
    async loadOptions() {
        const response = await this.loadListData();
        // Parse the options from the response
        const options = JSON.parse(response.options);

        return options;
    }

    async loadListData() {
        // Check if the list property is empty
        if (this.list === "") {
            console.error("Cannot get options for the main list.");
            return null;
        }

        // Define the URL for the AJAX request
        const url = `/api/locations.php?&id=${this.list}&action=single`;

        // Define the settings for the AJAX request
        const ajaxSettings = {
            url: url,
            type: "GET",
            success: (data) => data,
            error: (data) => {
                console.error(data);
                return data;
            },
        };

        // Make the AJAX request
        const response = await $.ajax(ajaxSettings);

        return response;
    }

    /**
     * Resets the URL parameters to their default values.
     * @returns {Promise} - A promise that resolves when the URL parameters are reset.
     */
    async resetURLParameters() {
        this.list = "";
        this.sort = "id";
        this.ascending = true;
        this.page = 0;
        this.limit = 10;
    }

    /**
     * Updates the URL parameters based on the current state of the object.
     * @returns {void}
     */
    updateURLParameters() {
        // Define the base URL.
        let url = "/?";

        // Add the limit parameter.
        url += `limit=${this.limit}`;

        // Add the page parameter.
        url += `&page=${this.page}`;

        // Add the sort parameter.
        url += `&sort=${this.sort}`;

        // Add the ascending parameter if it's true.
        if (this.ascending) {
            url += "&asc";
        }

        // Add the list parameter if it's not empty.
        if (this.list !== "") {
            url += `&list=${this.list}`;
        }

        // Add the keyword parameter if it's not empty.
        if (this.keyword !== "") {
            url += `&q=${this.keyword}`;
        }

        // Update the browser's history state.
        window.history.pushState("", "", url);
    }

    /**
     * Retrieves the columns of the database.
     * @returns {Promise} - A promise that resolves with the columns of the database.
     */
    async loadColumns() {
        // Make an asynchronous AJAX request.
        return await $.ajax({
            // Set the URL for the request. If the list in the instance is empty, request the columns for "locations". Otherwise, request the columns for the list.
            url: `/api/location.php?action=columns&id=${this.list == "" ? "locations" : this.list}`,
            // Set the method for the request to "GET".
            type: "GET",
            // If the request is successful, return the columns from the response data.
            success: (data) => {
                return data.columns;
            },
            // If the request fails, log the error data and return it.
            error: (data) => {
                console.error(data);
                return data;
            },
        });
    }

    /**
     * Retrieves the columns and column display names of the database.
     * @returns {Promise} - A promise that resolves with the columns of the database.
     */
    async loadColumnDisplayNames() {
        // Load the column names from the database and extract the columns property.
        let columns = (await this.loadColumns()).columns;
        // Initialize an empty array to store the display names.
        let displayNames = [];
        // Convert the columns to an array and iterate over each column.
        Array.from(columns).forEach((column) => {
            // Replace underscores in the column name with spaces and add it to the displayNames array.
            displayNames.push(column.replace("_", " "));
        });
        // Return an object with the columns and displayNames arrays.
        return { columns: columns, displayNames: displayNames };
    }

    /**
     * Retrieves the columns of the database.
     * @returns {Promise} - A promise that resolves with the columns of the database.
     */
    async generateTable() {
        // Load the column display names from the database.
        let columns = await this.loadColumnDisplayNames();
        // Extract the display names from the columns object.
        let displayNames = columns.displayNames;
        // Extract the column names from the columns object.
        columns = columns.columns;
        // Store the column names in the instance.
        this.columns = columns;
        // Create a new table element with a thead and tbody.
        let items = $("<table><thead></thead><tbody></tbody></table>");
        // Get the data from the instance.
        let data = this.data;
        // If the data is undefined or empty, append a "No data found!" message to the tbody and return the table.
        if (data == undefined || data.length == 0) {
            items.find("tbody").append("<p>No data found!</p>");
            return items;
        }
        // Append a new row to the thead.
        items.find("thead").append(`<tr></tr>`);
        // For each display name...
        for (let i = 0; i < columns.length; i++) {
            // Get the display name and corresponding column name.
            let displayName = displayNames[i];
            let column = columns[i];
            // If the column name is "options" or "image", return.
            if (column == "options" || column == "image") continue;
            // If the column name is "id", set the display name to an empty string.
            if (column == "id") displayName = "";
            // Create a new th element with the class "location-{column}" and the sort attribute set to the column name.
            let th = $(`<th class="location-${column}" sort="${column}">${displayName}</th>`);
            // If the column name is the same as the sort column in the instance, set the direction attribute to the sort direction.
            if (column == this.sort) {
                th.attr("direction", this.ascending ? "asc" : "desc");
            }
            // Append the th element to the row in the thead.
            items.find("thead tr").append(th);
        }

        // Convert the items in the data object to an array and iterate over each item.
        Array.from(data.items).forEach((item) => {
            // Create a new Date object from the post_date property of the item.
            let date = new Date(item.post_date);
            // Initialize the image variable to an empty string.
            let image = "";
            // If the item has an image, set the image variable to an img element with the source set to the image path.
            if (item.image != undefined && item.image != "") {
                image = `<img src="/assets/images/locations/${item.image}">`;
            }
            // If the list in the instance is empty...
            if (this.list == "") {
                // Create a new row with the item data.
                let row = $(`
                <tr id="${item.id}">
                    <td class="location-icon">${image}</td>
                    <td class="location-name">${item.name}</td>
                    <td class="location-address">${item.location}</td>
                    <td class="location-po">${item.po}</td>
                    <td class="location-date">${date.toLocaleDateString("en-us", { hour: "2-digit", minute: "2-digit", weekday: "long", year: "numeric", month: "short", day: "numeric" })}</td>
                </tr>
                `);
                // Add a click event listener to the row that loads the item details.
                row.on("click", () => this.load(this.limit, 0, "id", true, "", item.id));
                // Append the row to the tbody of the table.
                items.find("tbody").append(row);
            } else {
                // Initialize the row variable to an empty string.
                let row = "";
                // For each column in the columns array...
                for (let i = 0; i < columns.length; i++) {
                    // Get the column name.
                    let column = columns[i];
                    // Get the value of the column in the item.
                    let value = item[column];
                    // If the value is undefined, set it to an empty string.
                    if (value == undefined) value = "";
                    // Add a new td element to the row with the class "location-{column}" and the value.
                    row += `<td class="location-${column}">${value}</td>`;
                }
                // Convert the row string to a jQuery object.
                row = $(`<tr id="${item.id}">${row}</tr>`);
                // Add a click event listener to the row that opens the list item options.
                row.on("click", () => {
                    if (selectedElements.length == 0) {
                        openListItemOptions(row);
                    } else {
                        selectElement(item.id);
                    }
                });
                row.on("contextmenu", (e) => {
                    e.preventDefault();
                    openListItemOptions(row);
                });
                // Append the row to the table.
                items.append(row);
            }
        });

        // Return the table.
        return items;
    }
    /**
     * Edit a list in the database.
     *
     * @async
     * @param {string} name - The new name of the list.
     * @param {string} location - The new location of the list.
     * @param {string} po - The new PO of the list.
     * @param {string} image - The new image of the list.
     * @param {JSON} options - The new options of the list.
     * @returns {void}
     */
    async editList(name, location, po, image, options) {
        // Define the URL for the AJAX request
        const url = `/api/locations.php?id=${this.list}&action=edit`;

        // Define the data to be sent to the server
        const data = {
            name: name,
            location: location,
            po: po,
            image: image,
            options: JSON.stringify(options),
        };

        // Define the settings for the AJAX request
        const ajaxSettings = {
            method: "POST",
            data: data,
            success: handleSuccess,
            error: handleError,
        };

        // Define the success handler
        function handleSuccess(data) {
            if (data.error) {
                console.error(`Error editing pricing list: ${data.error}`);
                alert(`Error editing pricing list: ${data.error}`);
                closePopup();
                return;
            }
            database.loadList(database.list);
            closePopup();
        }

        // Define the error handler
        function handleError(xhr, status, error) {
            console.error(`Error editing pricing list: ${error}`);
            alert(`Error editing pricing list: ${error}`);
            closePopup();
        }

        // Make the AJAX request
        $.ajax(url, ajaxSettings);
    }

    async editListItem(json) {
        const url = `/api/location.php?id=${this.list}&action=edit`;

        const ajaxSettings = {
            method: "POST",
            data: json,
            success: handleSuccess,
            error: handleError,
        };

        function handleSuccess(data) {
            if (data.error) {
                console.error(`Error editing pricing list: ${data.error}`);
                alert(`Error editing pricing list: ${data.error}`);
                closePopup();
                return;
            }
            database.loadList(database.list);
            closePopup();
        }

        function handleError(xhr, status, error) {
            console.error(`Error editing pricing list: ${error}`);
            alert(`Error editing pricing list: ${error}`);
            closePopup();
        }

        await $.ajax(url, ajaxSettings);
    }

    async deleteItem(id) {
        const url = `/api/location.php?id=${this.list}&item=${id}`;
        console.log(url);

        const ajaxSettings = {
            method: "DELETE",
            success: handleSuccess,
            error: handleError,
        };

        function handleSuccess(data) {
            if (data.error) {
                console.error(`Error deleting pricing list: ${data.error}`);
                alert(`Error deleting pricing list: ${data.error}`);
                closePopup();
                return;
            }
            database.loadList(database.list);
            closePopup();
        }

        function handleError(xhr, status, error) {
            console.error(`Error deleting pricing list: ${error}`);
            alert(`Error deleting pricing list: ${error}`);
            closePopup();
        }

        await $.ajax(url, ajaxSettings);
    }

    /**
     * Deletes all rows in the current list.
     */
    async deleteAllRows() {
        // If the list is empty, return.
        if (this.list == "") return;
        // Close any open popups.
        closePopup();
        // Open the loading popup.
        openPopup("loading-popup");
        // Define the URL for the API request.
        const url = `/api/location.php?id=${this.list}`;
        // Make an asynchronous DELETE request to the API.
        await $.ajax({
            url: url,
            method: "DELETE",
            success: () => {
                // If the request is successful, reload the list.
                this.loadList(this.list);
            },
            error: (data) => {
                // If the request fails, alert the user with the error message and close the popup.
                alert(`Error deleting all rows: ${data.error}`);
                closePopup();
            },
        });
        // Close the loading popup.
        closePopup();
    }

    /**
     * Deletes the current list.
     */
    async deleteList() {
        // If the list is empty, return.
        if (this.list == "") return;
        // Make an asynchronous DELETE request to the API.
        await $.ajax(`/api/locations.php?id=${this.list}`, {
            method: "DELETE",
            success: (data) => {
                // If the request is successful but there's an error in the response data, log the error and alert the user.
                if (data.error) {
                    console.error(`Error deleting pricing list: ${data.error}`);
                    alert(`Error deleting pricing list: ${data.error}`);
                    return;
                }
                // If the request is successful and there's no error in the response data, reload the list and close any open popups.
                this.loadList("");
                closePopup();
            },
            error: (xhr, status, error) => {
                // If the request fails, log the error and alert the user.
                console.error(`Error deleting pricing list: ${error}`);
                alert(`Error deleting pricing list: ${error}`);
            },
        });
    }

    /**
     * Opens a voice search popup and handles voice search functionality.
     *
     * @returns {void}
     */
    openVoicePopup() {
        // Create a new Voice instance
        let voice = new Voice(/[^0-9]/g);

        // Check if the browser supports voice recognition
        if (voice.unsupported) return;

        // Add the "active" class to the voice search popup
        openPopup("voice-search-popup");

        // Add an event listener for the "close" event on the voice search popup
        $("#voice-search-popup.popup").on("close", () => {
            // Stop the voice recognition
            voice.stop();
            // Clear the search
            this.search("");
        });

        // Start the voice recognition
        voice.start();

        // Add an event listener for the "result" event on the voice recognition
        $(voice).on("result", async (_, transcript) => {
            // Update the voice notification text
            $(".voice-notification > p").text(transcript);
            // Remove the "active" class from the voice notification
            closePopup();

            // Search the database with the transcript
            let data = await this.search(transcript);
            let items = data.items;

            // Get the title and price of the first item
            let title = items[0][database.options["voice-description-column"]];
            let price = items[0][database.options["voice-price-column"]];
            price = price.replace("$", "");

            // Handle the search results
            if (items != undefined) {
                if (items.length == 0) {
                    voice.speak(`No results found!`);
                } else if (items.length == 1) {
                    voice.speak(`Found 1 result`);
                    voice.speak(`${title} is $${price}`);
                } else {
                    voice.speak(`Found ${items.length} results`);
                    voice.speak(`The first result is ${title} at $${price}`);
                }
            }
        });

        // Add an event listener for the "interim" event on the voice recognition
        $(voice).on("interim", (_, transcript) => {
            // Update the voice notification text
            $(".voice-notification > p").text(transcript);
            // Add the "active" and "results" classes to the voice notification
            $(".voice-notification").addClass("active");
            $(".voice-notification").addClass("results");
        });

        // Add an event listener for the "end" event on the voice recognition
        $(voice).on("end", () => {
            // Reset the voice notification text
            $(".voice-notification p").text("Listening...");
            // Remove the "results" class from the voice notification
            $(".voice-notification").removeClass("results");
            // Restart the voice recognition if it should still be listening
            if (voice.shouldListen) voice.start();
        });
    }
}

/**
 * Represents a pagination manager for the database.
 */
class Pagination {
    /**
     * Initializes a new instance of the Pagination class.
     * @param {Database} database The database object.
     */
    constructor(database) {
        // Total number of items in the database
        this.total_items = Number.parseInt(database.data.total_results);
        // Current page number
        this.current_page = database.data.page;
        // Number of items to display per page
        this.items_per_page = database.data.max_count;
        // Last page number
        this.last_page = 0;
        // Total number of pages
        this.pages = this.items_per_page > 0 ? Math.ceil(this.total_items / this.items_per_page) : 0;
        // Reference to the database object
        this.database = database;
    }

    /**
     * Generates the HTML for pagination.
     * @returns {jQuery} The pagination HTML element.
     */
    getPaginationHTML() {
        // Create a new pagination container element
        let pagination = $("<div class='pagination row center horizontal vertical fill'></div>");

        // Calculate the total number of pages
        this.pages = Math.ceil(this.total_items / this.items_per_page);
        this.last_page = this.pages;

        // Check if current page is less than 1 and set it to 1
        if (this.current_page < 1) {
            this.current_page = 1;
        }

        // If there is only one page, return the pagination element
        if (this.pages <= 1) return pagination;
        // Add "Previous" button if there are more than 0 pages
        else if (this.pages > 0) {
            let previous = $('<div class="page-item"><button class="page-link secondary">Previous</button></div>');
            previous.on("click", () => this.previous());
            pagination.prepend(previous);
        }

        // Add page buttons for each page
        for (let i = 1; i <= this.pages; i++) {
            let item = $(`<div class="page-item ${i == this.current_page ? "active" : ""}"><button class="page-link ${this.page == i - 1 ? "" : "secondary"}">${i}</button></div>`);
            item.on("click", () => {
                this.page = i - 1;
                this.load();
            });
            pagination.append(item);
        }

        // Add "Next" button
        let next = $('<div class="page-item"><button class="page-link secondary">Next</button></div>');
        next.on("click", () => this.next());
        pagination.append(next);

        return pagination;
    }

    /**
     * Moves to the previous page.
     */
    previous() {
        if (this.current_page < this.last_page - 1) {
            this.current_page++;
            this.database.load({ page: this.current_page, limit: this.items_per_page });
            $(this).trigger("previous");
        }
    }

    /**
     * Moves to the next page.
     */
    next() {
        if (this.current_page > 0) {
            this.current_page--;
            this.database.load({ page: this.current_page, limit: this.items_per_page });
            $(this).trigger("next");
        }
    }
}
