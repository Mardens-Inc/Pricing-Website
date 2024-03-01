import {startLoading, stopLoading} from "./loading.js";

/**
 * Represents a directory list.
 */
export default class DirectoryList {

    /**
     *  Initializes a new instance of the DirectoryList class.
     */
    constructor() {
        this.list = $(".list");
        this.items = [];

        $("#hero button").on('click', async () => {
            startLoading({fullscreen: true})
            this.list.empty();
            await this.loadView("", true);
            $(this).trigger("unloadExternalView");
            stopLoading();
        })
    }


    /**
     * Loads the view based on the given query.
     *
     * @param {string} query - The query to be used for loading the view.
     * @param {boolean} [force=false] - Determines whether the view should be forcefully loaded even if the data has not changed.
     * @returns {Promise<void>} A promise that resolves when the view has been loaded and built.
     */
    async loadView(query, force = false) {
        const newList = await this.getListItems(query);
        if (force || newList !== this.items) {
            this.items = newList;
            this.buildPagination();
        }
    }

    async search(query) {
        await this.loadView(query, true);
        return this.items;
    }


    /**
     * Retrieves a list of items from the API based on an optional query.
     *
     * @param {string} query - Optional query parameter to filter the items.
     * @returns {Promise<Array>} - A promise that resolves to an array of items.
     */
    async getListItems(query = "") {

        // Set the image source to an SVG icon
        img.attr('src', "assets/images/icon.svg");

        // Set the title to "Pricing Database"
        title.html("Pricing<br>Database");

        // Hide the subtitle
        subtitle.css("display", "none");

        // Hide the back button
        backButton.css("display", "none");

        // Define the API endpoint for fetching all locations
        const url = `${baseURL}/api/locations/all`;

        try {
            // Attempt to fetch data from the API using a GET request
            let newList = await $.ajax({url: url, method: "GET", headers: {"Accept": "application/json"}});

            // If a query parameter is provided, filter the list items
            if (query !== "") {

                // Normalize the query string by removing all non-alphanumeric characters and converting to lowercase
                query = query.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

                // Filter the list items based on the normalized query string
                newList = newList.filter((item) => {

                    // Compare the query string with the name, location, and PO fields of each item (after similar normalization)
                    return item["name"].toLowerCase().replace(/[^A-Za-z0-9]/g, "").includes(query) ||
                        item["location"].toLowerCase().replace(/[^A-Za-z0-9]/g, "").includes(query) ||
                        item["po"].toLowerCase().replace(/[^A-Za-z0-9]/g, "").includes(query);
                });
            }

            // Return the filtered list (if a query was provided) or the original list (if no query was provided)
            return newList;

        } catch (e) {

            // If an error occurs during the fetching process, log an error message
            console.error("Unable to fetch data from the server\n", url, e);
        }
    }

    /**
     * Builds the pagination for the loaded list of items.
     *
     * @returns {void}
     */
    buildPagination() {
        // Check if list items are loaded. If list is empty, end the function (Don't build pagination)
        if (this.items.length === 0) {
            this.list.html(`<h1 class="center vertical horizontal">No items found</h1>`);
            $(".pagination").html("");
            return;
        }
        // Try to build pagination using the loaded list items
        try {
            // Initialize pagination for a HTML element with 'pagination' class
            $(".pagination").pagination({

                // Set data source to loaded list items
                dataSource: this.items,

                // Configurations for pagination controls
                autoHideNext: false, // Keep 'next' control visible
                autoHidePrevious: false, // Keep 'previous' control visible
                pageSize: 10, // Number of entries per page
                pageRange: 1, // Range of pages displayed at once

                // Callback function to execute after pagination
                // It builds HTML structure for each page
                callback: (data, _) => this.buildListHTML(data)
            })

            // Error handling - If pagination fails to build, log the error in console
        } catch (e) {
            console.error(`Unable to build pagination\nLoaded List: ${this.items}\n`, e);
        }
    }


    /**
     * Builds the HTML representation of a list of items.
     *
     * @param {Array} items - An array of items to be displayed in the list.
     */
    buildListHTML(items) {
        // Start with a clean list
        this.list.html("");

        items.forEach((item) => {
            // Create elements for each part of a list item
            const list = $(`<div class="list-item"></div>`);
            const clickableArea = $(`<div class="fill"></div>`);
            const img = $(`<img src="${item["image"] === "" ? "/assets/images/icon.png" : item["image"]}" alt="">`);
            const title = $(`<span class="title">${item["name"]}</span>`);
            const location = item["location"] === "" ? "Unknown" : item["location"];
            const po = item["po"] === "" ? "No PO Found" : item["po"];
            const date = item["post_date"] === "" ? "No Date" : new Date(item["post_date"]).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
            const extra = $(`<span class="extra">${location} / ${po} / <i><b>${date}</b></i></span>`);

            // Create buttons for editing and additional options
            const editButton = $(`<button class="edit-list-button" title="Edit product"><img src="assets/images/icons/edit.svg" alt=""></button>`);
            const moreButton = $(`<button class="more-options" data-title="More Options" tabindex="0"><img src="assets/images/icons/more.svg" alt=""></button>`);

            editButton.on('click', ()=>{
                $(this).trigger("loadEdit", [item["id"]]);
            })

            // Attach an event listener to the more options button that opens a dropdown menu
            moreButton.on('click', (e) => {
                openDropdown(moreButton, {
                    "Edit": () => {
                        $(this).trigger("loadEdit", [item["id"]]);
                    },
                    "Delete": () => {
                        console.log("Delete")
                    }
                })
            });

            // Attach an event listener to the list item itself that transitions to a new view when clicked
            clickableArea.on('click', async () => $(this).trigger("loadExternalView", [item["id"]]));

            // Attach the created elements to the list item
            clickableArea.append(img);
            title.append(extra);
            clickableArea.append(title);
            list.append(clickableArea);
            list.append(editButton);
            list.append(moreButton);

            // Attach the fully constructed list item to the list itself
            this.list.append(list);
        });

        // Invoke function to handle labels
        loadLabels();
    }


}
