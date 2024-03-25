import auth from "./authentication.js";
import {print} from "./crossplatform-utility.js";
import {buildInventoryingForm} from "./database-inventorying.js";
import {buildOptionsForm} from "./database-options-manager.js";
import {download} from "./filesystem.js";
import {buildImportFilemakerForm} from "./import-filemaker.js";
import {startLoading, stopLoading} from "./loading.js";
import {alert, confirm, openPopup} from "./popups.js";

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
     * @param {string|null} id - The ID of the instance.
     *
     * @return {void}
     */
    constructor(id) {
        this.list = $(".list");
        this.list.empty()
        this.items = [];
        this.id = id;
    }

    static async create() {
        if (!auth.isLoggedIn) return;
        const db = new DatabaseList(null)
        db.list.empty();
        db.list.append(await buildOptionsForm(null, async () => {
            window.location.reload();
        }));
        $(document).trigger("load")
    }

    async load() {
        startLoading({fullscreen: true});
        const {name, location, po, image, options, posted} = await this.getListHeader();
        if (image !== "") {
            img.attr('src', image);
            img.css("border-radius", "12px");
        } else {
            img.attr('src', "assets/images/icon.svg");
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

        this.importing = false;
        if (this.id !== null) {
            if (this.items.length === 0) {
                this.importing = true;
                if (options.hasOwnProperty("from_filemaker")) {
                    if (auth.isLoggedIn && auth.getUserProfile().admin) {
                        this.list.append(await buildImportFilemakerForm())
                    } else {
                        alert("This database is empty, and you do not have permission to import data.<br>Please contact an administrator for assistance.", () => {
                            window.localStorage.removeItem("loadedDatabase");
                            window.location.reload();
                        });
                    }
                }
            } else {
                if (options.hasOwnProperty("from_filemaker"))
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
        if (!this.importing) {
            $("#search").val(query);
            await this.loadView(query, true);
            $(document).trigger("load")
            return this.items;
        }
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
        if (this.id === null) return [];
        let newList = [];
        try {
            if (query !== null && query !== undefined && query !== "") {
                try {
                    const searchColumns = this.options.columns.filter(c => c.attributes.includes("search"));
                    const primaryKey = this.options.columns.filter(c => c.attributes.includes("primary"))[0];
                    query = query.toLowerCase().replace(/^0+/, ''); // convert to lowercase and remove leading zeros

                    const url = `${baseURL}/api/location/${this.id}/search`;
                    const searchQuery = {
                        "query": query,
                        "columns": searchColumns.map(c => c.real_name),
                        "limit": 100,
                        "offset": 0,
                        "asc": true,
                        "sort": primaryKey === undefined ? "id" : primaryKey.real_name
                    }

                    newList = await $.ajax({url: url, method: "POST", data: JSON.stringify(searchQuery), contentType: "application/json", headers: {"Accept": "application/json"}});
                    newList = newList["items"];
                } catch (e) {
                    console.error(e);
                    return [];
                }


            } else {
                const url = `${baseURL}/api/location/${this.id}/`;
                newList = await $.ajax({url: url, method: "GET"});
                newList = newList["results"]["items"];
            }
        } catch (e) {
            console.error(`Error fetching items for location ${this.id}`)
            console.error(e);
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
        if (this.options.columns === undefined) return;
        this.options.columns = this.options.columns.filter(c => c !== null && c !== undefined);
        const table = this.buildColumns();
        table.css('--columnSize', `${(1 / (this.options.columns.filter(i => i.visible).length + 1)) * 100}%`);
        const tbody = $("<tbody>");
        this.items.forEach((item) => {
            const tr = $(`<tr id='${item.id}' class='list-item'>`);
            let mp = null;
            let retail = null;
            try {
                for (const column of this.options.columns) {
                    if (column.visible) {
                        const attributes = column.attributes ?? [];
                        let text = item[column.real_name] ?? "";
                        if (attributes.includes("price") || attributes.includes("mp")) {
                            try {
                                text = text.replace(/[^0-9.]/g, "")
                                text = text === "" ? "0" : text;
                                text = parseFloat(text).toFixed(2);

                                if (attributes.includes("mp")) mp = text;
                                if (attributes.includes("price")) retail = text;

                                text = `$${text}`;
                            } catch (e) {
                                console.error(e)
                            }
                        } else if (attributes.includes("quantity")) {
                            text = text.replace(/[^0-9-]/g, "")
                            text = text === "" ? "0" : text;
                            text = parseInt(text);
                        }
                        const td = $("<td>").html(text === "" ? "-" : text);
                        for (const attribute of attributes) {
                            td.addClass(attribute)
                        }
                        tr.append(td);
                    }
                }
            } catch (e) {
                console.error(e)
            }
            const extra = $("<td></td>")
            extra.addClass("extra")
            const extraButton = $(`<button title="More Options..."><i class='fa fa-ellipsis-vertical'></i></button>`);
            const printButton = $(`<button title="Print"><i class='fa fa-print'></i></button>`);
            printButton.on("click", () => print({
                label: this.options["print-form"].label,
                year: this.options["print-form"].year,
                department: null,
                retail: retail,
                mp: mp
            }));

            const showExtraButton = auth.isLoggedIn;
            extraButton.on("click", () => {
                openDropdown(extraButton, {
                    "View History": () => {
                        openPopup("history", {history: item.history});
                    },
                    "Copy": () => {
                        navigator.clipboard.writeText(JSON.stringify(item, null, 2));
                    },
                    "Delete": () => {
                        confirm("Are you sure you want to delete this item?", "Delete Item", "Cancel", async (value) => {
                            if (!value) return;
                            startLoading({fullscreen: true, message: "Deleting..."})
                            try {
                                await $.ajax({url: `${baseURL}/api/location/${this.id}/${item.id}`, method: "DELETE"});
                                await this.loadView("", true);
                            } catch (e) {
                                console.error(e)
                                alert("An error occurred while trying to delete the item.");
                            }
                            stopLoading();
                        });
                    }
                }, {"View History": item.history !== undefined && item.history.length > 0});
            });
            try {
                if (this.options["allow-inventorying"]) {
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
                }
            } catch (e) {
                console.error(e)
            }
            if (this.options["print-form"].enabled)
                extra.append(printButton);
            if (showExtraButton && auth.isLoggedIn && auth.getUserProfile().admin)
                extra.append(extraButton);
            tr.append(extra);
            tbody.append(tr);
        });
        this.list.empty();
        table.append(tbody);
        this.list.append(table);
        console.log(this.items)
        if (this.options["allow-inventorying"] && auth.isLoggedIn) {
            this.list.append(await buildInventoryingForm(this.options["allow-additions"], this.options.columns, this.options["add-if-missing"], this.options["remove-if-zero"], this.options["voice-search"]));
        }

        $(document).trigger("load")
    }

    buildColumns() {

        const table = $("<table class='fill col'></table>");
        try {
            if (this.options.columns === undefined) return table;
            const columns = this.options.columns.filter(c => c !== null && c !== undefined && c.visible);
            const thead = $("<thead>");

            for (const column of columns) {
                if (column === null || column === undefined) continue;
                const th = $("<th>").html(column.name);
                thead.append(th);
            }

            thead.append($("<th class='extra'>"));

            table.append(thead);
        } catch (e) {
            console.error("Error building columns")
            console.error(e)
        }
        return table;
    }


    /**
     * Retrieves the header information for the specified location.
     *
     * @return {Promise<ListHeading>} - A promise that resolves to an object containing the header information.
     */
    async getListHeader() {
        if (this.id === null) return {name: "", location: "", po: "", image: "", options: [], posted: ""};
        const url = `${baseURL}/api/location/${this.id}/?headings=true`;
        return await $.ajax({url: url, method: "GET"});
    }

    /**
     * Export the items data to a CSV file and initiate the download of the file.
     *
     * @return {void}
     */
    async exportCSV() {
        startLoading({fullscreen: true, message: "Exporting..."})
        const csv = (await $.get({url: `${baseURL}/api/location/${this.id}/export`, headers: {"Accept": "text/csv"}})).toString();
        const headers = await this.getListHeader();
        const name = `${headers.name}-${headers.po}-${this.id}.csv`;
        download(name, csv);
        stopLoading();

    }

    async edit() {
        this.list.empty();
        this.list.append(await buildOptionsForm(this.id, async () => {
            window.location.reload();
        }));

        $(document).trigger("load")
    }

}

