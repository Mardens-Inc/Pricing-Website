import {buildOptionsForm} from "./database-options-manager.js";
import {startLoading, stopLoading} from "./loading.js";
import {buildImportFilemakerForm} from "./import-filemaker.js";
import {download} from "./filesystem.js";
import {buildInventoryingForm} from "./database-inventorying.js";
import auth from "./authentication.js";

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
        console.log('hi')
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
                this.list.append(await buildImportFilemakerForm())
            } else {
                if (options.length === 0 || options.layout === null || options.layout === "") {
                    await this.edit();
                }
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
                    if (attributes.includes("price") || attributes.includes("mp")) {
                        try {
                            text = text.replace(/[^0-9.]/g, "")
                            text = parseFloat(text).toFixed(2);
                            text = `$${text}`;
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    const td = $("<td>").html(text === "" ? "-" : text);
                    for (const attribute of attributes) {
                        td.addClass(attribute)
                    }
                    tr.append(td);
                }
            }
            const extra = $("<td></td>")
            extra.addClass("extra")
            const extraButton = $(`<button><i class='fa fa-ellipsis-vertical'></i></button>`);

            const showExtraButton = this.options["print-form"].enabled || auth.isLoggedIn;

            extraButton.on("click", () => {
                openDropdown(extraButton, {
                    "Print": async () => {
                        console.log("Print")
                        await window.__TAURI__.invoke("print", {printer: JSON.parse(window.localStorage.getItem("settings")).selected_printer, content: "Hello, World!"})
                    },
                    "Delete": () => {
                        console.log("Delete")
                    }
                }, {"Print": this.options["print-form"].enabled, "Delete": auth.isLoggedIn})
            });
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

            extra.append(extraButton);
            tr.append(extra);
            tbody.append(tr);
            if (!showExtraButton) {
                extra.css('opacity', 0);
                extra.css('pointer-events', 'none');
            }
        });
        this.list.empty();
        table.append(tbody);
        this.list.append(table);
        console.log(this.items)
        if (this.options["allow-inventorying"]) {
            this.list.append(await buildInventoryingForm(this.options["allow-additions"], this.options.columns));
        }

        $(document).trigger("load")
    }

    buildColumns() {
        const table = $("<table class='fill col'></table>");
        const columns = this.options.columns.filter(c => c.visible);
        const thead = $("<thead>");

        for (const column of columns) {
            const th = $("<th>").html(column.name);
            thead.append(th);
        }

        thead.append($("<th class='extra'>"));

        table.append(thead);
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

