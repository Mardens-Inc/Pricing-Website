var printElement = undefined;
var selectedElements = [];

/**
 * Handle event listeners
 */

$("#upload-pricing-data-button").on("click", (e) => {
    e.preventDefault();
    let json = {};

    $(`.comparison-input`).each((_, element) => {
        let column = $(element).attr("column");
        let value = $(element).find("select").val();
        if (value == "none") return;
        let newValue = loadedJson[value];
        json[column] = newValue;
    });

    closePopup();
    openPopup("loading-popup");

    $.ajax(`/api/location.php?id=${database.list}`, {
        method: "POST",
        data: JSON.stringify(json),
        success: (data) => {
            if (data.error) {
                console.error(`Error uploading pricing data: ${data.error}`);
                alert(`Error uploading pricing data: ${data.error}`);
                closePopup();
                return;
            }
            database.loadList(database.list);
            closePopup();
            alert(`Added: ${data.inserted} items\nFailed: ${data.failed} items`);
        },
        error: (xhr, status, error) => {
            console.error(`Error uploading pricing data: ${error}`);
            alert(`Error uploading pricing data: ${error}`);
            closePopup();
        },
    });
});

$("#upload-row-data").on("upload", (_, data) => {
    let json = "";
    // If the file is an xlsx, convert it to a csv, then to json
    if (data.name.endsWith(".xlsx")) {
        let reader = new FileReader();
        reader.readAsBinaryString(data.file);
        reader.onload = () => {
            let csv = Parser.ExcelToCSV(reader.result);
            json = Parser.CSVToJSON(csv);
            handleCreateDatabaseEntryUpload(json, data.name);
        };
        // If the file is a csv, convert it directly to json
    } else if (data.name.endsWith(".csv")) {
        json = Parser.CSVToJSON(data.content);
        handleCreateDatabaseEntryUpload(json, data.name);
    } else {
        alert("Invalid file type");
        return;
    }
});

$("#edit-pricing-options-popup toggle[name='print']").on("toggle", (_, data) => {
    $("#edit-pricing-options-popup .print-form").css("display", data.value ? "" : "none");
});
$("#edit-pricing-options-popup toggle[name='voice-search']").on("toggle", (_, data) => {
    $("#edit-pricing-options-popup .voice-form").css("display", data.value ? "" : "none");
});

/**
 * Shows the popup for adding a new pricing list item
 */
function showAddPricingListItem() {
    // Hide the upload button
    $("#upload-pricing-data-button").css("display", "none");

    // Hide the other popups
    closePopup();

    // Show the create pricing entry popup
    openPopup("create-pricing-entry-popup");

    // When we upload pricing data, use the parser to convert it to JSON
    $("#upload-pricing-data").on("upload", (_, data) => {
        let json = "";
        if (data.name.endsWith(".xlsx")) {
            // If it's an xlsx file, we need to convert it to CSV first
            let reader = new FileReader();
            reader.readAsBinaryString(data.file);
            reader.onload = () => {
                let csv = Parser.ExcelToCSV(reader.result);
                json = Parser.CSVToJSON(csv);
                // Once we have JSON, show the comparison
                showComparison(json);
            };
        } else if (data.name.endsWith(".csv")) {
            // If it's a CSV file, we can skip the conversion
            json = Parser.CSVToJSON(data.content);
            // Once we have JSON, show the comparison
            showComparison(json);
        } else {
            // If it's not one of the two file types we support, show an error message
            alert("Invalid file type");
            return;
        }
    });
}

/**
 * Shows the comparison form based on the uploaded json
 * @param {JSON} json
 */
function showComparison(json) {
    // set the global variable loadedJson to the json
    // from the file
    loadedJson = json;

    // get the form element
    let form = $("#comparison-form");

    // create a string to hold the content of the form
    let content = "";

    // get the keys from the json object
    let keys = Object.keys(json);

    // create a string to hold the options for the select
    let options = "";

    // add an option for none
    options += `<option value="none">none</option>`;

    // for each key in the json object
    keys.forEach((key) => {
        // add an option for the key
        options += `<option value="${key}">${key}</option>`;
    });

    // for each column in the columns array
    database.columns.forEach((column) => {
        // add a div with the column name as an attribute
        content += `
        <div class="row fill comparison-input" column="${column}">
            <span class="fill">${column}</span>
            <span class="fill">&#10142;</span>
            <select class="fill" name="${column}">${options}</select>
        </div>`;
    });

    // set the content of the form to the content string
    form.html(content);

    // show the upload pricing data button
    $("#upload-pricing-data-button").css("display", "");
}

function showEditPricingListOptions() {
    closePopup();
    openPopup("edit-pricing-options-popup");

    $(`#edit-pricing-options-popup #icon-list.list .list-item.selected`).removeClass("selected");
    $(`#edit-pricing-options-popup #icon-list.list .list-item[name="${database.listData.image}"]`).addClass("selected");
    let selectedIcon = $(`#edit-pricing-options-popup #icon-list.list .list-item.selected`);
    if (selectedIcon.length != 0) {
        $("#edit-pricing-options-popup #icon-list.list").scrollTop(selectedIcon[0].offsetTop - 50);
    }
    $("#edit-pricing-options-popup input[name=name]").val(database.listData.name);
    $("#edit-pricing-options-popup input[name=location]").val(database.listData.location);
    $("#edit-pricing-options-popup input[name=po]").val(database.listData.po);

    $("#edit-pricing-options-popup toggle[name='print']").attr("value", database.options.print == true);
    $("#edit-pricing-options-popup toggle[name='show-date']").attr("value", database.options["show-date"] == true);
    $("#edit-pricing-options-popup toggle[name='voice-search']").attr("value", database.options["voice-search"] == true);
    $("#edit-pricing-options-popup .print-form").css("display", database.options.print == true ? "" : "none");
    $("#edit-pricing-options-popup .voice-form").css("display", database.options["voice-search"] == true ? "" : "none");
    $("#edit-pricing-options-popup input[name='print-label']").val(database.options["print-label"]);
    $("#edit-pricing-options-popup input[name='print-year']").val(database.options["print-year"]);

    let options = "";
    for (let i = 0; i < database.columns.length; i++) {
        options += `<option value="${database.columns[i]}">${database.columns[i]}</option>`;
    }

    $("#edit-pricing-options-popup select#print-price-column").html(options);
    $("#edit-pricing-options-popup select#print-price-column").val(database.options["print-price-column"]);

    $("#edit-pricing-options-popup select#print-retail-price-column").html(options);
    $("#edit-pricing-options-popup select#print-retail-price-column").val(database.options["print-retail-price-column"]);

    $("#edit-pricing-options-popup select#voice-price-column").html(options);
    $("#edit-pricing-options-popup select#voice-price-column").val(database.options["voice-price-column"]);

    $("#edit-pricing-options-popup select#voice-description-column").html(options);
    $("#edit-pricing-options-popup select#voice-description-column").val(database.options["voice-description-column"]);
}
function editPricingListOptions() {
    let name = $("#edit-pricing-options-popup input[name=name]").val();
    let location = $("#edit-pricing-options-popup input[name=location]").val();
    let po = $("#edit-pricing-options-popup input[name=po]").val();
    let image = $(`#edit-pricing-options-popup #icon-list.list .list-item.selected`).attr("name");
    let options = {
        print: $("#edit-pricing-options-popup toggle[name='print']").attr("value") === "true",
        "voice-search": $("#edit-pricing-options-popup toggle[name='voice-search']").attr("value") === "true",
        "print-label": $("#edit-pricing-options-popup input[name='print-label']").val(),
        "print-year": $("#edit-pricing-options-popup input[name='print-year']").val(),
        "print-price-column": $("#edit-pricing-options-popup select#print-price-column").val(),
        "print-retail-price-column": $("#edit-pricing-options-popup select#print-retail-price-column").val(),
        "print-show-retail": $("#edit-pricing-options-popup toggle[name='print-show-retail']").attr("value") === "true",
        "voice-price-column": $("#edit-pricing-options-popup select#voice-price-column").val(),
        "voice-description-column": $("#edit-pricing-options-popup select#voice-description-column").val(),
        "show-date": $("#edit-pricing-options-popup toggle[name='show-date']").attr("value") === "true",
    };
    database.editList(name, location, po, image, options);
}
function openListItemOptions(element) {
    printElement = element;
    database.options = JSON.parse(database.listData.options);
    closePopup();
    $("#list-item-options-popup .title").html(selectedElements.length > 1 ? "Multiple Items Selected" : "Selected Item");
    openPopup("list-item-options-popup");
    $("#edit-list-item-popup").attr("selectedId", $(element).attr("id"));
    $("#delete-entry-button").attr("onclick", `database.deleteItem("${$(element).attr("id")}")`);
    $("#select-entry-button").attr("onclick", `selectElement("${$(element).attr("id")}")`);
    $("#list-item-options-popup.popup #print-button").css("display", database.options.print ? "" : "none");
}

function selectElement(id) {
    $(`#${id}`).addClass("selected");
    selectedElements.push(id);
    console.log(selectedElements);
    closePopup();
}

function print() {
    if (printElement == undefined) return;
    let price = $(printElement).find(`.location-${database.options["print-price-column"]}`).text().replace(/[^0-9.]/g, "");
    let retail = $(printElement).find(`.location-${database.options["print-retail-price-column"]}`).text().replace(/[^0-9.]/g, "");

    let url = new URL("print.php", window.location.origin);
    url.searchParams.set("title", database.options["print-label"]);
    url.searchParams.set("year", database.options["print-year"]);
    url.searchParams.set("price", price);
    if (database.options["print-show-retail"]) url.searchParams.set("retail", retail);

    let pw = window.open(url.href, "Print Window", "width=800,height=600");
    pw.addEventListener("load", () => pw.print()); // Print the window when it loads
    pw.addEventListener("blur", () => pw.close()); // Close the window when it loses focus
    closePopup();
    printElement == undefined;
}

function openEditListItem() {
    closePopup();
    id = $("#edit-list-item-popup").attr("selectedId");
    let form = $("#edit-list-item-popup .form-input");
    form.html("");
    for (let i = 0; i < database.columns.length; i++) {
        let column = database.columns[i];
        if (column == "id" || column == "date") continue;
        let row = $($(`#${id} .location-${column}`)[0]);
        if (row.length == 0) continue;
        let value = row.text();
        let label = $(`<label for="${column}">${column.replace(/_/g, " ").toUpperCase()}</label>`);
        let input = $(`<input type="text" name="${column}" value="${value}">`);

        form.append(label);
        form.append(input);
    }

    let button = $(`<button>Save</button>`);
    $(button).on("click", async () => {
        let json = { id: id };
        $(`#edit-list-item-popup .form-input input`).each((_, element) => {
            let column = $(element).attr("name");
            let value = $(element).val();
            json[column] = value;
        });
        json = JSON.stringify(json);
        await database.editListItem(json);
        await database.loadList(database.list);
        closePopup();
    });
    form.append(button);

    openPopup("edit-list-item-popup");
}
