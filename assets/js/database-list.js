import {buildOptionsForm} from "./database-options-manager.js";
import {startLoading, stopLoading} from "./loading.js";
import {buildImportFilemakerForm} from "./import-filemaker.js";
import {download} from "./filesystem.js";
import {buildInventoryingForm} from "./database-inventorying.js";

/**
 * Represents a list of items in a database.
 *
 * @class
 */
export default class DatabaseList {
    function

    /**
     * Constructor for creating a new instance of the class.
     *
     * @param {string} id - The ID of the instance.
     *
     * @return {void}
     */
    constructor(id) {
        this.list = $(".list");
        this.items = [];
        this.id = id;
    }

    async load() {
        startLoading({fullscreen: true});
        const {name, location, po, image, options, posted} = await this.getListHeader();
        if (image !== "") {
            img.attr('src', image);
            img.css("border-radius", "12px");
        }
        this.options = options;
        title.html(name);
        subtitle.html(`${location} - ${po}`).css("display", "");
        backButton.css("display", "");
        this.list.html("");
        $(".pagination").html("");
        $("#search").val("");
        try {
            await this.loadView("", true);
        } catch (e) {
            console.error(e)
        }

        if (this.items.length === 0) {
            this.list.append(await buildImportFilemakerForm())
        } else {
            if (options.length === 0 || options.layout === null || options.layout === "") {
                await this.edit();
            }
        }

        $(document).trigger("load")
        stopLoading()
    }

    /**
     * Loads and displays a view based on the given query.
     *
     * @param {string} query - The query to fetch data and build the view.
     * @param {boolean} [force=false] - Flag that determines whether to force fetching the data and rebuilding the view, even if the data hasn't changed.
     *
     * @return {Promise<void>} - A promise that resolves once the view is loaded and displayed.
     */
    async loadView(query, force = false) {
        const newList = await this.getListItems(query);
        if (force || newList !== this.items) {
            this.items = newList;
            await this.buildList()
        }
    }

    /**
     * Performs a search using the given query.
     *
     * @param {string} query - The search query.
     * @return {Promise<Array>} - A promise that resolves to an array of items matching the search query.
     */
    async search(query) {
        await this.loadView(query, true);
        $(document).trigger("load")
        return this.items;
    }

    /**
     * Retrieves a list of items for the location.
     *
     * @param {string} [query=""] - The optional query string to filter the list of items.
     * @returns {Promise<Array>} - A promise that resolves with an array of items.
     *
     * @example
     * getListItems("book");
     * // Returns a promise that resolves with an array of book items.
     *
     * @example
     * getListItems();
     * // Returns a promise that resolves with the complete list of items.
     */
    async getListItems(query = "") {
        let newList = [];

        if (query !== null && query !== undefined && query !== "") {
            const searchColumns = this.options.columns.filter(c => c.attributes.includes("search"));
            const primaryKey = this.options.columns.filter(c => c.attributes.includes("primary"))[0];
            query = query.toLowerCase();

            const url = `${baseURL}/api/location/${this.id}/search`;
            const searchQuery = {
                "query": query,
                "columns": searchColumns.map(c => c.name),
                "limit": 100,
                "offset": 0,
                "asc": true,
                "sort": primaryKey === undefined ? "id" : primaryKey.name
            }

            newList = await $.ajax({url: url, method: "POST", data: JSON.stringify(searchQuery), contentType: "application/json", headers: {"Accept": "application/json"}});
            newList = newList["items"];


        } else {
            const url = `${baseURL}/api/location/${this.id}/`;
            newList = await $.ajax({url: url, method: "GET"});
            newList = newList["results"]["items"];
        }
        return newList;
    }

    /**
     * Builds a list of items.
     *
     * If the list of items is empty, it calls the `buildImportFilemakerForm` function
     * and sets the HTML content of `this.list` to the result of the function call.
     * If the list of items is not empty, it clears the HTML content of `this.list` and
     * adds HTML elements for each item in `this.items`.
     *
     * @returns {Promise<void>} A promise that resolves when the list is built.
     */
    async buildList() {
        const table = this.buildColumns();
        const tbody = $("<tbody>");
        this.items.forEach((item) => {
            const tr = $(`<tr id='${item.id}' class='list-item'>`);
            for (const column of this.options.columns) {
                if (column.visible) {
                    const attributes = column.attributes ?? [];
                    let text = item[column.name];
                    if (attributes.includes("price")) {
                        try {
                            text = parseFloat(text).toFixed(2);
                            text = text.toString().toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2, currencyDisplay: "symbol"});
                            text = `$${text}`;
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    const td = $("<td>").html(text === "" ? "-" : text);
                    tr.append(td);
                }
            }
            const extra = $("<td></td>")
            extra.css("justify-content", "end")
            const extraButton = $(`<button><i class='fa fa-ellipsis-vertical'></i></button>`);
            extraButton.on("click", () => {
                openDropdown(extraButton, {
                    "Print":async () => {
                        console.log("Print")
                        await window.__TAURI__.invoke("print", {printer: JSON.parse(window.localStorage.getItem("settings")).selected_printer, content: "Hello, World!"})
                    },
                    "Edit": () => {
                        console.log("Edit")
                    },
                    "Delete": () => {
                        console.log("Delete")
                    }
                })
            });

            tr.on('click', e => {
                if (e.target.tagName === "BUTTON") return;
                tbody.find(`tr:not(#${item.id})`).removeClass("selected");

                if (tr.hasClass("selected")) {
                    tr.removeClass("selected");
                    $(document).trigger("item-selected", null);
                    return;
                }

                tr.toggleClass("selected");
                $(document).trigger("item-selected", item);
            })


            extra.append(extraButton);
            tr.append(extra);
            tbody.append(tr);
        });
        this.list.empty();
        table.append(tbody);
        this.list.append(table);
        console.log(this.options)
        if (this.options["allow-inventorying"]) {
            this.list.append(await buildInventoryingForm(this.options["allow-additions"], this.options.columns));
        }
    }

    buildColumns() {
        const table = $("<table class='fill col'></table>");
        const columns = this.options.columns.filter(c => c.visible);
        const thead = $("<thead>");

        for (const column of columns) {
            const th = $("<th>").html(column.name);
            thead.append(th);
        }

        thead.append($("<th>"));

        table.append(thead);
        return table;
    }

    buildItemizedList() {
    }

    /**
     * Retrieves the header information for the specified location.
     *
     * @return {Promise<ListHeading>} - A promise that resolves to an object containing the header information.
     */
    async getListHeader() {
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        return await $.ajax({url: url, method: "GET"});
    }

    /**
     * Export the items data to a CSV file and initiate the download of the file.
     *
     * @return {void}
     */
    exportCSV() {
        const items = this.items;
        const csv = items.map(item => {
            return Object.values(item).join(",");
        }).join("\n");
        download("export.csv", csv);

    }

    async edit() {
        this.list.empty();
        this.list.append(await buildOptionsForm(this.id, async () => {
            window.location.reload();
            // await this.loadView("", true);
            // console.log("Reloaded")
        }));

        $(document).trigger("load")
    }
}


/*
const list = $(".list");
let loadedListItems = [];
let currentId = "";
let currentQuery = "";
backButton.on('click', () => loadView("", "", true));
loadView("", "", true);
setInterval(async () => await loadView(currentId, currentQuery), 30 * 1000);

async function loadList(id = "", query = "") {
    currentQuery = query;
    currentId = id;
    if (!id) {
        return await loadDatabaseList(query);
    } else {
        return await loadDatabase(id, query);
    }

}


$("#search").on("keyup", async (e) => {
    await loadView(currentId, e.target.value, true);
});


async function loadDatabase(id = "", query = "") {
    const {_, name, location, po, image, options, posted} = await getListHeader(id);
    console.log(id, name, location, po, image, options, posted);

    if (image !== "") {
        img.attr('src', image);
        img.css("border-radius", "12px");
    }
    title.html(name);
    subtitle.html(`${location} - ${po}`).css("display", "");
    backButton.css("display", "");
    list.html("");
    $(".pagination").html("");
    $("#search").val("");

    loadedListItems = [];

    return [];
}



 */