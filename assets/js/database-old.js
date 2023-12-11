var isDirectoryHeader;
var loadedList = undefined;
var isVoiceSearch = false;
let last_page;
let columns = [];
var loading = $('<div class="loading"></div>');
var startLoading = () => {
    $("#table-body").html(loading);
};
var stopLoading = () => {
    loading[0].remove();
};
load();

/**
 * Load data from the server
 */
function load() {
    // Check if the list parameter is not empty. If not, then load the list.
    if (list != "") return loadList(list);
    loadedList = undefined;
    // If the isDirectoryHeader variable is not defined or is false, load the header.
    if (!isDirectoryHeader || isDirectoryHeader == undefined) loadHeader(true);
    // Remove the list view class from the search table.
    $("table.search-table").removeClass("list-view");
    // Remove the direction attribute from all table headers.
    $("th").removeAttr("direction");
    // Add the direction attribute to the table header that corresponds to the sort parameter.
    $(`th[sort="${sort}"]`).attr("direction", ascending ? "asc" : "desc");
    // Get the search keyword from the search input box.
    let keyword = $("#search").val();
    // Update the URL with the new parameters.
    window.history.pushState("", "", `/?limit=${$("#entries").val()}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&q=" + keyword}${list == "" ? "" : "&list=" + list}`);
    // Get the limit parameter from the entries input box.
    let limit = $("#entries").val();
    // Create the URL for the API request.
    let url = `/api/locations.php?limit=${limit}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&action=search&query=" + keyword}`;
    // Send the request.
    $.ajax({
        url: url,
        type: "GET",
        success: (data) => {
            // Hide the elements that should only be visible in the list view.
            $(".only-on-list-view").css("display", "none");
            // Stop the loading animation.
            stopLoading();
            // Create the table element from the data.
            let element = createElement(data.items);
            // Put the table element inside the table body.
            $("#table-body").html(element);
            // If the number of results is equal to the limit, then show the message with the number of results on the current page.
            if (data.items.length == limit) {
                $("#showing-message").html(`Showing ${data.items.length * page + 1} to ${data.items.length * page + data.items.length} of ${data.total_results} entries`);
            } else {
                // Otherwise, show the message with the number of results on the last page.
                $("#showing-message").html(`Showing ${data.total_results - data.items.length} to ${data.total_results} of ${data.total_results} entries`);
            }
            // Display the pagination.
            displayPagination(limit, data.total_results, data.page);
        },
        error: (data) => {
            // If the request fails, log the error and show a message.
            console.error(data);
            stopLoading();
            $("#table-body").html("<p>Failed to load data</p>");
        },
    });
}

function loadDirectory() {
    list = "";
    sort = "id";
    ascending = true;
    page = 0;
    load();
}

function loadList(id) {
    if (list != id) {
        page = 0;
        sort = "id";
        ascending = true;
    }
    list = id;
    if (isDirectoryHeader || isDirectoryHeader == undefined) loadHeader(false);
    startLoading();
    $("table.search-table").addClass("list-view");
    $("table.search-table th").removeAttr("direction");
    $(`th[sort="${sort}"]`).attr("direction", ascending ? "asc" : "desc");
    let keyword = $("#search").val();
    window.history.pushState("", "", `/?limit=${$("#entries").val()}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&q=" + keyword}${list == "" ? "" : "&list=" + list}`);
    let limit = $("#entries").val();
    let url = `/api/location.php?limit=${limit}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&query=" + keyword}&id=${id}`;
    $.ajax({
        url: url,
        type: "GET",
        success: (data) => {
            stopLoading();
            if (data.success == false) {
                $("#table-body").html(`<p>Failed to load data: ${data.error}</p>`);
            } else {
                $(".only-on-list-view").css("display", "");
                let element = createElement(data.items);
                $("#table-body").html(element);
                if (data.items != undefined && data.items.length > 0) {
                    if (data.items.length == limit) {
                        $("#showing-message").html(`Showing ${data.items.length * page + 1} to ${data.items.length * page + data.items.length} of ${data.total_results} entries`);
                    } else {
                        $("#showing-message").html(`Showing ${data.total_results - data.items.length} to ${data.total_results} of ${data.total_results} entries`);
                    }
                }
                getLocationData(list);
            }
        },
        error: (data) => {
            console.error(data);
            stopLoading();
            $("#table-body").html("<p>Failed to load data</p>");
        },
    });
}
async function loadVoiceSearch(keyword) {
    if (isDirectoryHeader || isDirectoryHeader == undefined) loadHeader(false);
    startLoading();
    $("table.search-table").addClass("list-view");
    $("table.search-table th").removeAttr("direction");
    $(`th[sort="${sort}"]`).attr("direction", ascending ? "asc" : "desc");
    window.history.pushState("", "", `/?limit=${$("#entries").val()}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}${keyword == "" ? "" : "&q=" + keyword}${list == "" ? "" : "&list=" + list}`);
    let limit = $("#entries").val();
    let url = `/api/location.php?limit=${limit}&page=${page}&sort=${sort}${ascending ? "&asc" : ""}&query=${keyword}&id=${list}`;
    return await $.ajax({
        url: url,
        type: "GET",
        success: (data) => {
            stopLoading();
            if (data.success == false) {
                $("#voice-table-body").html(`<p>Failed to load data: ${data.error}</p>`);
            } else {
                let element = createElement(data.items);
                $("#voice-table-body").html(element);
                if (data.items != undefined && data.items.length > 0) {
                    $("#voice-showing-message").html(`${data.total_results} Results`);
                    return data;
                }
                getLocationData(list);
            }
        },
        error: (data) => {
            console.error(data);
            stopLoading();
            $("#table-body").html("<p>Failed to load data</p>");
        },
    });
}

function getLocationData(id) {
    let url = `/api/locations.php?&action=single&id=${id}`;
    $.ajax({
        url: url,
        type: "GET",
        success: (data) => {
            if (data != undefined) {
                $("#page-header").html(isDirectoryHeader ? "Pricing Database Directory" : `<u>${data.name}<i style="font-weight: 400">#${data.po}</i></u> Pricing Database`);
                loadedList = data;
            }
        },
        error: (data) => {
            console.error(data);
            loadedList = undefined;
        },
    });
}

/**
 * Loads the table header for the directory or location page
 * @param {boolean} directory If true, load directory header, else load location header
 */
function loadHeader(directory = true) {
    isDirectoryHeader = directory;

    if (directory) {
        $("table.search-table thead tr").html(`
        <th sort="id">#</th>
        <th id="name-header" sort="name">Name</th>
        <th id="location-header" sort="location">Location</th>
        <th id="po-header" sort="po">PO#</th>
        <th id="date-header" sort="post_date">Post Date</th>
        `);
        $("#page-header").html("Pricing Database Directory");

        $(".search-table th").on("click", (e) => {
            let target = $(e.target);

            let sortTarget = target.attr("sort");
            if (sortTarget == sort) {
                ascending = !ascending;
            } else {
                sort = sortTarget;
                ascending = true;
            }

            $("th").removeAttr("direction");
            target.attr("direction", ascending ? "asc" : "desc");

            load();
            startLoading();
        });
    } else {
        $("#voice-search-table thead tr").html("");
        $.ajax({
            url: `/api/location.php?id=${list}&action=columns`,
            method: "GET",
            success: (data) => {
                columns = data.columns;
                let headers = "";
                for (let i = 1; i < columns.length; i++) {
                    let column = columns[i];

                    let name = column.replace(/_/g, " ");
                    name = name.replace(/\w\S*/g, function (txt) {
                        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                    });
                    headers += `<th id="${column}-header" sort="${column}">${name}</th>`;
                }
                $("table.search-table thead tr").html(headers);
                columns.splice(0, 1);

                $(".search-table th").on("click", (e) => {
                    let target = $(e.target);

                    let sortTarget = target.attr("sort");
                    if (sortTarget == sort) {
                        ascending = !ascending;
                    } else {
                        sort = sortTarget;
                        ascending = true;
                    }

                    $("th").removeAttr("direction");
                    target.attr("direction", ascending ? "asc" : "desc");

                    load();
                    startLoading();
                });
            },
            error: (data) => {
                console.error(data);
            },
        });
    }
}

/**
 * Create table row html from json data
 * @param {JSON} data Json response from the server
 * @returns table row html
 */
function createElement(data) {
    let items = "";
    if (data == undefined || data.length == 0) return "<p>No results found</p>";
    Array.from(data).forEach((item) => {
        let date = new Date(item.post_date);
        let image = "";
        if (item.image != undefined && item.image != "") {
            image = `<img src="/assets/images/locations/${item.image}">`;
        }
        if (list == "") {
            items += `
            <tr onclick="loadList('${item.id}')">
            <td class="location-icon">${image}</td>
            <td class="location-name">${item.name}</td>
            <td class="location-address">${item.location}</td>
            <td class="location-po">${item.po}</td>
            <!--<td class="location-date">${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}</td>-->
            <td class="location-date">${date.toLocaleDateString("en-us", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</td>
            </tr>
            `;
        } else {
            let row = "";
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                let value = item[column];
                if (value == undefined) value = "";
                row += `<td class="location-${column}">${value}</td>`;
            }
            items += `<tr  onclick="openListItemOptions(this)">${row}</tr>`;
        }
    });
    return items;
}

function displayPagination(items_per_page, total_items, current_page) {
    let pagination = $(".pagination");
    pagination.html("");
    let pages = Math.ceil(total_items / items_per_page);
    last_page = pages;

    if (current_page < 1) {
        current_page = 1;
    }
    if (pages <= 1) return;
    else if (pages > 0) {
        let previous = $('<div class="page-item"><button class="page-link secondary">Previous</button></div>');
        previous.on("click", () => {
            if (page > 0) {
                page--;
                load();
            }
        });
        pagination.prepend(previous);
    }

    for (let i = 1; i <= pages; i++) {
        let item = $(`<div class="page-item ${i == current_page ? "active" : ""}"><button class="page-link ${page == i - 1 ? "" : "secondary"}">${i}</button></div>`);
        item.on("click", () => {
            page = i - 1;
            load();
        });
        pagination.append(item);
    }

    let next = $('<div class="page-item"><button class="page-link secondary">Next</button></div>');
    next.on("click", () => {
        if (page < last_page - 1) {
            page++;
            load();
        }
    });
    pagination.append(next);
}

$("#entries").on("change", () => {
    page = 0;
    load();
});
$("#search").on("keyup", () => {
    page = 0;
    load();
});
$("#clear-search").on("click", () => {
    page = 0;
    $("#search").val("");
    load();
});
$("#directory-button").on("click", loadDirectory);

$("body").on("keyup", (e) => {
    if ($(".popup.active").length > 0) return;
    switch (e.key) {
        case "ArrowRight":
            if (page < last_page - 1) {
                page++;
                load();
            }
            break;
        case "ArrowLeft":
            if (page > 0) {
                page--;
                load();
            }
            break;
    }
});
