/**
 * Set event listeners
 */
$("input[name='rows']").on("keyup", (e) => {
    if (e.key == "Enter" || e.key == ",") {
        e.preventDefault();
        addRow();
    }
});

$("#create-database-entry-popup.popup .form-input").on("submit", (e) => {
    e.preventDefault();
    if (!$("input[name='rows']").is(":focus")) {
        submitCreateDatabaseEntry();
    }
});


loadDatabaseImages(); // Load the database images


/**
 * Opens the popup for creating a new database entry
 */
function openCreateDatabaseEntryPopup() {
    closePopup();
    openPopup("create-database-entry-popup");
}

/**
 * Loads the database images
 */
function loadDatabaseImages() {
    let element = $("#icon-list.list");
    let url = `/api/locations.php?action=get-images`;
    $.get(url, (data) => {
        if (data.error) {
            console.error(`Error loading database images: ${data.error}`);
            return;
        }
        element.html("");
        for (let i = 0; i < data.length; i++) {
            let image = data[i];
            element.append(`
                <div class="list-item" onclick="selectDatabaseImage(this)" name="${image.file}">
                    <img src="${image.url}" alt="${image.name}">
                    <span>${image.name}</span>
                </div>
            `);
        }
    });
}

/**
 * Creates a new database entry for the current list
 */
function submitCreateDatabaseEntry() {
    let name = $("#create-database-entry-popup.popup input[name='name']").val();
    let location = $("#create-database-entry-popup.popup input[name='location']").val();
    let po = $("#create-database-entry-popup.popup input[name='po']").val();
    let image = $("#icon-list.list .list-item.selected").attr("name");
    if (image == undefined) {
        image = "";
    }
    let r = rows.join(";");
    $.ajax("/api/locations.php", {
        method: "POST",
        data: {
            name: name,
            location: location,
            po: po,
            image: image,
            rows: r,
        },
        success: (data) => {
            if (data.error) {
                console.error(`Error creating database entry: ${data.error}`);
                $("#create-database-entry-popup.popup .error").html(`ERROR: ${data.error}`);
            }
            closePopup();
            database.loadList(data.id);
        },
        error: (xhr, status, error) => {
            console.error(`Error creating database entry: ${error}`);
            $("#create-database-entry-popup.popup .error").html(`ERROR: ${error}`);
            closePopup();
        },
    });
}

/**
 * Loads the list of pricing lists
 * @param {HTMLElement} element
 */
function selectDatabaseImage(element) {
    element = $(element);
    if (element.hasClass("selected")) {
        element.removeClass("selected");
    } else {
        $("#icon-list.list .list-item.selected").removeClass("selected");
        element.addClass("selected");
    }
}

/**
 * Adds a row to the rows list
 */
function addRow() {
    let input = $("input[name='rows']");
    let value = input.val();
    nrows = value.split(",");
    for (let i = 0; i < nrows.length; i++) {
        let name = nrows[i]
            .toLowerCase()
            .trim()
            .replace(/\s/g, "_")
            .replace(/[^a-z_]/g, "");
        if (name.endsWith(",")) name = name.substring(0, name.length - 1);
        if (name == "") continue;
        rows.push(name);
    }
    input.val("");
    updateRowsList();
}

/**
 * Updates the rows list
 */
function updateRowsList() {
    $(".row-items").html("");
    let index = 0;
    rows.forEach((row) => {
        $(".row-items").append(`<span class="row-item" onclick="removeRow(${index})" title="Remove '${row}'">${row}</span>`);
        index++;
    });
}

/**
 * Removes a row from the rows list
 * @param {number} index The index of the row to remove
 */
function removeRow(index) {
    rows.splice(index, 1);
    updateRowsList();
}

/**
 * Populates the name and rows fields with the data from the uploaded file
 * @param {JSON} json The json object
 * @param {string} filename The name of the file.
 */
function handleCreateDatabaseEntryUpload(json, filename) {
    let name = $("#create-database-entry-popup.popup input[name='name']");
    let location = $("#create-database-entry-popup.popup input[name='location']");
    let po = $("#create-database-entry-popup.popup input[name='po']");

    name.val(filename);
    location.val("");
    po.val("");
    rows = Object.keys(json);
    updateRowsList();
}
