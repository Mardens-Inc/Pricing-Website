/**
 * @typedef {Object} ListHeading
 * @property {string} name
 * @property {string} location
 * @property {string} po
 * @property {string} image
 * @property {ListOptions} options
 * @property {string} post_date
 * @property {string[]} columns
 */
/**
 * @typedef {Object} ListOptions
 * @property {bool} allow-inventorying
 * @property {bool} allow-additions
 * @property {Object} print-form
 * @property {boolean} print-form.enabled
 * @property {string} print-form.print-label
 * @property {string} print-form.print-year
 * @property {string} print-form.print-price-column
 * @property {string} print-form.print-retail-price-column
 * @property {boolean} print-form.print-show-retail
 * @property {Object} voice-form
 * @property {boolean} voice-form.enabled
 * @property {string} voice-form.voice-description-column
 * @property {string} voice-form.voice-price-column
 * @property {Object[]} columns
 * @property {string} columns.name
 * @property {boolean} columns.visible
 * @property {string[]} columns.attributes
 */

/**
 * @typedef {Object} Icon
 * @property {string} name
 * @property {string} url
 * @property {string} file
 */


import {startLoading, stopLoading} from "./loading.js";

/**+
 * @type {ListHeading}
 */
let currentOptions = {};
/**
 * @type {ListHeading}
 */
let originalOptions = {};
/**
 * @type {string[]}
 */
let originalColumns = [];
let renamedColumns = [];

/**
 * Builds the options form for a given id.
 *
 * @param {string} id - The id to retrieve the options for.
 * @param {function} onclose - The function to call when the form is closed.
 * @return {Promise<JQuery>} - A Promise that resolves to the HTML form representing the options.
 */
async function buildOptionsForm(id, onclose) {
    startLoading({fullscreen: true})
    const html = $(await $.ajax({url: "assets/html/database-options-form.html", method: "GET"}));
    currentOptions = await getCurrentOptions(id);
    console.log(currentOptions)
    originalOptions = {...currentOptions};
    originalColumns = currentOptions.columns;
    await buildIconList(html);
    createColumnList(html);
    setDefaultOptionValues(html);
    html.find("#save").on("click", async () => {
        await save(id);
        onclose();
    });
    html.find("#cancel").on("click", onclose);
    stopLoading();
    return html;
}

/**
 * @param {string} id
 * @returns {Promise<Object>}
 */
async function getCurrentOptions(id) {
    return $.get(`${baseURL}/api/location/${id}/?headings=true`);
}

/**
 * Navigates to the icon list and populates it with icons.
 *
 * @param {JQuery} html - The HTML element or DOM object where the icons will be appended.
 * @return {Promise} - A promise that resolves when the icons have been loaded and rendered.
 */
async function buildIconList(html) {
    /**
     * @type {Icon[]}
     */
    const icons = await $.get(`${baseURL}/api/locations/images`);
    const selectedIcon = icons.find(icon => icon.url === currentOptions.image);
    for (const icon of icons) {
        const name = icon.name.replace(/[^a-zA-Z]/g, "-");
        const iconHTML = $(`
                        <input type="radio" class="icon-item" id="${name}" name="icon" value="${icon.file}">
                        <label for="${name}" class="col">
                        <img src="${icon.url}" alt="${icon.name}">
                        <p>${icon.name}</p>
                        </label>`);
        if (selectedIcon && selectedIcon.name === icon.name) {
            iconHTML.attr("checked", "checked");
        }
        html.find("#icons.list").append(iconHTML);
    }
    // move selected icon to the front, if one exists
    if (selectedIcon) {
        html.find("#icons.list").prepend(html.find(`input[value="${selectedIcon.name}"]`).parent());
        html.find("#icons.list").prepend(html.find(`label[for="${selectedIcon.name}"]`).parent());
    }
}

/**
 * Sets the default option values for the form.
 * @param {JQuery} html
 */
function setDefaultOptionValues(html) {
    html.find("input#database-name").val(currentOptions.name);
    html.find("input#database-location").val(currentOptions.location);
    html.find("input#database-po").val(currentOptions.po);
    html.find("toggle#show-date").attr("value", currentOptions.options["show-date"]);
    html.find("toggle#voice-search").attr("value", currentOptions.options["voice-search"]);
    html.find("toggle#print").attr("value", currentOptions.options["print"]);
    html.find("toggle#allow-inventorying").attr("value", currentOptions.options["allow-inventorying"] ?? false);
    html.find("toggle#allow-additions").attr("value", currentOptions.options["allow-additions"] ?? false);
}

function createColumnList(html) {
    const list = html.find("#column-list");
    list.empty();
    if (currentOptions.options.columns === undefined || currentOptions.options.columns.length === 0) {
        currentOptions.options.columns = currentOptions.columns.filter(i => i !== "id").map(c => {
            if (c === "date") return ({name: c, visible: false});
            return ({name: c.toString(), visible: true})
        });
    }
    currentOptions.options.columns.sort((a, b) => a.visible === b.visible ? 0 : a.visible ? -1 : 1);
    for (const columnItem of currentOptions.options.columns) {
        if (columnItem.name === "id") continue; // skip the id column

        const column = columnItem.name;
        const visible = columnItem.visible;

        const listItem = $(`
        <div class="row fill column-item${(visible ? "" : " hidden")}" name="${column}">
            <i class="fa-solid fa-grip-vertical"></i>
            <div class="name fill">${column}</div>
            <div class="attributes row"></div>
            <i class="fa-solid fa-ellipsis-vertical" title="More Options..."></i>
        </div>`);

        // add attributes
        const attributes = [
            {name: "primary", icon: "fa-solid fa-key", unique: true, "description": "Mark this item as the primary key, which will be used to uniquely identify each item.<br><b>There can only be one primary key.</b>"},
            {name: "price", icon: "fa fa-tag", unique: false, "description": "Mark this item as a price column, which will be used to format it as currency."},
            {name: "search", icon: "fa-solid fa-magnifying-glass", unique: false, "description": "Mark this item as a search column, which will be used to search for items."},
            {name: "quantity", icon: "fa-solid fa-1", unique: true, "description": "Mark this item as a quantity column, which will be used to calculate the total price of an item and incrementing and decrementing inventory.<br><b>There can only be one quantity column.</b>"},
            {name: "description", icon: "fa-solid fa-align-justify", unique: true, "description": "Mark this as the description column, this will be used for voice search.<br><b>There can only be one description column.</b>"},
            {name: "mp", icon: "fa-solid fa-percent", unique: true, "description": "Mark this as the Marden's Price column.<br><b>There can only be one Marden's Price column.</b>"},
            {name: "readonly", icon: "fa-solid fa-lock", unique: false, "description": "Mark this item as readonly, which will prevent it from being edited and remove it from the addition form."},
        ];
        for (const attribute of attributes) {
            let column = currentOptions.options.columns.find(c => c.name === listItem.attr("name"));
            if (column.attributes === undefined) column.attributes = [];
            const attributeHTML = $(`<i class="attribute ${attribute.icon} ${attribute.name} ${column.attributes.includes(attribute.name) ? "active" : ""}" title="${attribute.description}"></i>`);
            attributeHTML.on("click", (e) => {
                // toggle the attribute
                let column = currentOptions.options.columns.find(c => c.name === listItem.attr("name"));
                const attributes = column.attributes ?? [];
                if (attributes.includes(attribute.name)) {
                    console.log(`removing ${attribute.name} from ${column.name}`)
                    attributes.splice(attributes.indexOf(attribute.name), 1);
                    $(e.currentTarget).removeClass("active");
                } else {
                    console.log(`adding ${attribute.name} to ${column.name}`)
                    if (attribute.unique) {
                        console.log(`removing ${attribute.name} from all other columns`)
                        $(`i.attribute.active.${attribute.name}`).removeClass("active");
                        // remove the attribute from all other columns
                        for (const c of currentOptions.options.columns) {
                            if(c.name === column.name) continue;
                            if (c.attributes !== undefined && c.attributes.includes(attribute.name))
                                console.log(`removing ${attribute.name} from ${c.name}`)
                            c.attributes = c.attributes.filter(a => a !== attribute.name);
                        }
                    }

                    attributes.push(attribute.name);
                    $(e.currentTarget).addClass("active");
                }
                currentOptions.options.columns = currentOptions.options.columns.map(c => c.name === column.name ? {...c, attributes: attributes} : c);
                console.log(currentOptions.options.columns.map(i => {
                    return {name: i.name, attribute: i.attributes}
                }))
            });

            listItem.find(".attributes").append(attributeHTML);
        }

        let isDragging = false;
        listItem.on("mousedown", (e) => {
            if (e.target.classList.contains("fa-ellipsis-vertical") || e.target.tagName === "I") return;
            console.log(e.target)
            const item = $(e.currentTarget);
            if (item.hasClass("hidden") || item.find(".name")[0].tagName === "INPUT") return; // don't drag if rename input is open or if the item is hidden

            isDragging = true;

            const height = item.height();
            const width = item.width();
            const clone = item.clone();

            // copy computed styles to the clone
            const computedStyle = window.getComputedStyle(item[0]);
            for (const prop of computedStyle) {
                clone.css(prop, computedStyle[prop]);
            }

            item.css("opacity", 0);

            clone.addClass("dragging");
            clone.css("position", "absolute");
            clone.css('background-color', '#6a7b68')
            clone.find('.attributes').remove();

            clone.css("width", 'auto');
            clone.css("height", height);
            clone.css("z-index", 100);
            clone.css("box-shadow", "2px 2px 5px 0px rgba(0, 0, 0, 0.5)");
            clone.attr('column', column);
            list.append(clone);
            $("body").trigger('mousemove', e);
        });

        $("body").on("mousemove", (e) => {
            if (!isDragging || !Number.isFinite(e.clientX) || !Number.isFinite(e.clientY)) return;
            const clone = $(".column-item.dragging");
            const item = $(`.column-item[name="${clone.attr("column")}"]`);
            const listPosition = $("main > .list").offset();
            const closestColumnItemToMousePosition = $(document.elementFromPoint(e.clientX, e.clientY + listPosition.top - (clone.height() * 4))).closest(".column-item:not(.dragging)");
            if (closestColumnItemToMousePosition.length > 0) {
                // move original item to the new position
                const index = closestColumnItemToMousePosition.index();
                const originalIndex = clone.index();
                if (originalIndex < index) {
                    closestColumnItemToMousePosition.after(clone);
                    closestColumnItemToMousePosition.after(item);
                } else {
                    closestColumnItemToMousePosition.before(clone);
                    closestColumnItemToMousePosition.before(item);
                }
                // update the index attribute of the clone to the current position of the item
                clone.attr("index", item.index());

            }
            clone.css("top", e.clientY - (clone.height() / 2));
            clone.css("left", e.clientX - (clone.width() / 2));
        });

        $("body").on("mouseup", (e) => {
            if (!isDragging) return;
            console.log("mouseup")
            const clone = $(".column-item.dragging");
            let newIndex = Number.parseInt(clone.attr("index")) - 1;
            newIndex = newIndex < 0 ? 0 : newIndex > currentOptions.options.columns.length - 1 ? currentOptions.options.columns.length - 1 : newIndex;
            const column = clone.attr("column");
            clone.remove();
            isDragging = false;
            const item = $(`.column-item[name="${column}"]`);
            item.css("opacity", '');
            item.css('display', '');
            let columns = currentOptions.options.columns.filter(c => c.name !== column);
            columns.splice(newIndex, 0, currentOptions.options.columns.find(c => c.name === column));
            currentOptions.options.columns = columns;
            createColumnList(html);
        });

        listItem.find("i.fa-ellipsis-vertical").on("click", (e) => {
            openDropdown(e.target, {
                "Rename": () => {
                    const column = listItem.attr("name");
                    const input = $(`<input class="name" type="text" value="${column}">`);
                    listItem.find(".name").replaceWith(input);
                    input.on("blur", () => {
                        currentOptions.options.columns = currentOptions.options.columns.map(c => c.name === column ? {...c, name: input.val()} : c);
                        listItem.find(".name").replaceWith(`<div class="name fill">${input.val()}</div>`);
                        listItem.attr("name", input.val());
                        // check if renamed column already contains the old column name and update it
                        if (renamedColumns.filter(c => c.old === column).length > 0) {
                            renamedColumns = renamedColumns.map(c => c.old === column ? {old: column, new: input.val()} : c);
                        } else {
                            renamedColumns.push({old: column, new: input.val()});
                        }
                        console.log(renamedColumns);
                    });

                    input.on("keyup", (e) => {
                        if (e.key === "Enter") {
                            input.trigger("blur");
                        }
                    })
                    input.trigger("focus");
                },
                "Toggle Visibility": () => {
                    const column = listItem.attr("name");
                    currentOptions.options.columns = currentOptions.options.columns.map(c => c.name === column ? {...c, visible: !c.visible} : c);
                    listItem.toggleClass("hidden");
                    createColumnList(html);
                },
                "Insert Before": () => {
                    const column = listItem.attr("name");
                    const input = $(`<input class="name" type="text" value="">`);
                    listItem.before(input);
                    input.on("blur", () => {
                        currentOptions.columns.push(input.val());
                        currentOptions.options.columns.push({name: input.val(), visible: true});
                        createColumnList(html);
                    });
                    input.focus();
                },
                "Insert After": () => {
                    const column = listItem.attr("name");
                    const input = $(`<input class="name" type="text" value="">`);
                    listItem.after(input);
                    input.on("blur", () => {
                        currentOptions.columns.push(input.val());
                        currentOptions.options.columns.push({name: input.val(), visible: true});
                        createColumnList(html);
                    });
                    input.focus();
                },
                "Delete": () => {
                    currentOptions.columns = currentOptions.columns.filter(c => c !== column);
                    currentOptions.options.columns = currentOptions.options.columns.filter(c => c.name !== column);
                    listItem.remove();
                }
            });
        });
        list.append(listItem);
        loadLabels();
    }
}


async function save(id) {
    startLoading({fullscreen: true});
    // build new options object
    const newOptions = {
        name: $("input#database-name").val(),
        location: $("input#database-location").val(),
        po: $("input#database-po").val(),
        image: $("input[name='icon']:checked").val(),
        options: {
            "allow-inventorying": $("toggle#allow-inventorying").attr("value") === "true" ?? false,
            "allow-additions": $("toggle#allow-additions").attr("value") === "true" ?? false,
            "voice-search-form": {
                "enabled": $("toggle#voice-search").attr("value") === "true" ?? false,
                "voice-description-column": $("input#voice-description-column").val() ?? "",
                "voice-price-column": $("input#voice-price-column").val() ?? ""
            },
            "print-form": {
                "enabled": $("toggle#print").attr("value") === "true" ?? false,
                "print-label": $("input#print-label").val() ?? "",
                "print-year": $("input#print-year").val() ?? "",
                "print-price-column": $("input#print-price-column").val() ?? "",
                "print-retail-price-column": $("input#print-retail-price-column").val() ?? "",
                "print-show-retail": $("toggle#print-show-retail").attr("value") ?? false
            },
            "columns": currentOptions.options.columns
        }
    };

    for (const column of renamedColumns) {
        try {
            console.log(`${baseURL}/api/location/${id}/columns/${column.old}`)
            const response = await $.ajax({
                url: `${baseURL}/api/location/${id}/columns/${column.old}`,
                method: "PATCH",
                data: JSON.stringify({name: column.new}),
                contentType: "application/json",
                headers: {"Accept": "application/json"},
            });
            console.log(response)
        } catch (e) {
            console.error(e);
            return;
        }
    }

    try {
        const response = await $.ajax({
            url: `${baseURL}/api/location/${id}/`,
            method: "PATCH",
            data: JSON.stringify(newOptions),
            contentType: "application/json",
            headers: {"Accept": "application/json"},
        })
        console.log(response);
    } catch (e) {
        console.log(e);
    }

    stopLoading();


}

async function reset() {
    await buildOptionsForm(id);
}

export {buildOptionsForm}