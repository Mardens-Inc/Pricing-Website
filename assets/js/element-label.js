// Create a new <div> with the class "label"
const label = $(`<div class="label"></div>`)
$(document).on("load", loadLabels);

if ($('.label').length === 0) {
    // Append the create "label" <div> to the <body> of the document
    $('body').append(label)
}

$(document).on("mousemove", (e) => {
    const hoverElement = $(e.target)
    if (hoverElement.attr('data-title')) {
        show(hoverElement)
    } else {
        hide()
    }
})

function loadLabels() {
// Remove the "title" attribute from all elements and store the value in a "data-title" attribute
// This is done to prevent the default browser tooltip from showing.
    $(`[title]`).each((i, element) => {
        const el = $(element)
        el.attr('data-title', el.attr('title'))
        el.attr('title', null)
    });
}

function show(element) {
    // Get the "title" attribute of the element which is moused over.
    const title = element.attr('data-title')
    // Set the text of the "label" to the "title" of the element
    label.html(title)

    // Calculate the initial x and y coordinates for the "label",
    // the location is calculated to be just below the element.
    let x = element.offset().left + element.width() / 2 - label.width() / 2
    let y = element.offset().top + element.height() + 44

    // Check if the "label" would exceed the right boundary of the window, if so adjust the x position.
    if (x + label.width() > window.innerWidth) {
        x = window.innerWidth - label.width() - 10
    }

    // Check if the "label" would exceed the bottom boundary of the window, if so adjust the y position.
    if (y + label.height() + 16 >= window.innerHeight) {
        // place above the element
        y = element.offset().top - label.height() - 20
    }

    // Apply the calculated x and y as well as set the "label" to visible.
    label.css({
        top: y,
        left: x,
        opacity: 1
    })
}

function hide() {
    label.css({
        opacity: 0
    });
}

$("*").on('scroll', e => {
    hide()
})
