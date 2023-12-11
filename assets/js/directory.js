// Hide elements that are only for the list view by default.
$(".only-on-list-view").hide();

// Create a new instance of the Database class.
const database = new Database();

// Add an event listener for the "loaded" event on the database object.
$(database).on("loaded", async (_, data) => {
    // Declare variables for the table and the search button.
    let table;
    let searchButton = $(`<button id="clear-search" title="Clear search">x</button>`);

    // If the data type is a directory...
    if (data.type == listTypes.directory) {
        // Hide elements that are only for the list view.
        $(".only-on-list-view").hide();

        // Generate the table for the directory.
        table = await database.generateTable();

        // Add a click event listener to the search button that clears the search.
        searchButton.on("click", () => {
            $("#search").val("");
            database.search("");
        });

        // Create a new Pagination object and replace the existing pagination with it.
        let pagination = new Pagination(database);
        $(".pagination").replaceWith(pagination.getPaginationHTML());
    }
    // If the data type is a location...
    else if (data.type == listTypes.location) {
        // Show elements that are only for the list view.
        $(".only-on-list-view").show();

        // Generate the table for the location.
        table = await database.generateTable();

        // Remove the location ID from the table.
        table.find(".location-id").remove();

        // Add the "list-view" class to the table.
        table.addClass("list-view");

        // If voice search is enabled and the webkitSpeechRecognition API is available...
        if (database.options["voice-search"] && "webkitSpeechRecognition" in window) {
            // Change the search button to a microphone icon.
            searchButton.html(`<i class="fas fa-microphone"></i>`);

            // Add a click event listener to the search button that opens the voice search popup.
            searchButton.on("click", () => {
                database.openVoicePopup();
            });
        }
        // If voice search is not enabled or the webkitSpeechRecognition API is not available...
        else {
            // Add a click event listener to the search button that clears the search.
            searchButton.on("click", () => {
                $("#search").val("");
                database.search("");
            });
        }

        if (!("webkitSpeechRecognition" in window)) console.error("Voice search is not supported in this browser.");
    }

    // Add the "search-table" class to the table.
    table.addClass("search-table");

    // Replace the existing search button with the new search button.
    $("button#clear-search").replaceWith(searchButton);

    // Add a click event listener to the table headers that sorts the list.
    table.find("th").on("click", (e) => database.sortList($(e.target).attr("sort"), !database.ascending));

    // Replace the existing table with the new table.
    $(".search-table").replaceWith(table);
});

// Add an input event listener to the search input field.
// When the user types into the search field, it triggers a search in the database using the input value.
$("#search").on("input", (e) => {
    database.search(e.target.value);
});

// Add a click event listener to the directory button.
// When the directory button is clicked, it triggers the loadList function in the database with an empty string as the argument.
$("#directory-button").on("click", () => {
    database.loadList("");
});

// Add a change event listener to the entries select field.
// When the number of entries to display is changed, it updates the limit in the database and reloads the list.
$("#entries").on("change", (e) => {
    database.limit = e.target.value;
    database.load(database.limit, database.page, database.sort, database.ascending, database.keyword, database.list);
});
