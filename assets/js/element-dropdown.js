// Creating a dropdown element
const dropdown = $(`<div class="dropdown-items" tabindex="-1"> </div>`)
if ($(".dropdown-items").length === 0) {
    // Appending the dropdown to the body of the HTML
    $('body').append(dropdown)
}

/**
 * Opens a dropdown menu with the given items.
 *
 * @param {JQuery|HTMLElement} element - The element that triggered the dropdown menu.
 * @param {Object} items - The items to populate the dropdown with.
 *                       Each item must be an object with a single key-value pair,
 *                       where the key represents the display name of the item,
 *                       and the value is a function to be executed when the item is clicked.
 *                       The function should have no parameters.
 *                       Example: [{ name: () => {} }, { ... }]
 * @param {Object} conditionals - An array of key-value pairs that represent conditional items.
 *
 * @return {void} - This method does not return anything.
 */
function openDropdown(element, items, conditionals = {}) {

    // Convert the element to a jQuery object
    element = $(element);

    // Clear the dropdown
    dropdown.html("");

    const numberOfVisibleItems = conditionals === {} ? Object.keys(items).filter(item => conditionals[item] !== undefined && conditionals[item]).length : Object.keys(items).length;
    if (numberOfVisibleItems === 0) {
        dropdown.html("<div class='dropdown-item'>No items available</div>")
    }


    // Populate the dropdown with the items
    for (const item of Object.keys(items)) {
        if (conditionals[item] !== undefined && !conditionals[item]) continue; // Skip this item if it's conditional and the condition is not met

        const itemElement = $(`<div class="dropdown-item">${item}</div>`);
        itemElement.on('click', () => {
            items[item]();
            closeDropdown()
        })
        dropdown.append(itemElement)
    }

    dropdown[0].scrollTo({top: 0, behavior: 'auto'});
    // Logic for positioning the dropdown menu.
    let x = element.offset().left + element.width() / 2 - (dropdown.width() / 2)
    const scrollYOffset = window.scrollY
    let y = element.offset().top + element.height() + 40 + scrollYOffset
    if (y + dropdown.height() > window.innerHeight) {
        y = window.innerHeight - dropdown.height() - 10
    }
    if (x + dropdown.width() > window.innerWidth) {
        x = window.innerWidth - dropdown.width() - 10
    }
    // Apply CSS styles to position the dropdown correctly
    dropdown.css({
        top: y,
        left: x,
        opacity: 1,
        "pointer-events": "all"
    })
    dropdown.trigger("focus")
}

function closeDropdown() {
    dropdown.css({
        opacity: 0,
        "pointer-events": "none"
    })
}

dropdown.on("blur", () => {
    closeDropdown()
});

$("*").on('scroll', e => {
    if (e.currentTarget !== dropdown[0]) {
        closeDropdown()
    }
})