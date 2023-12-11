// Add a submit event listener to all form elements.
// Prevent the default form submission behavior.
$("form").on("submit", (e) => {
    e.preventDefault();
});

// Add a dragover event listener to all elements with the class "drag-drop-area".
// Prevent the default dragover behavior and add the "dragover" class to the target element.
$(".drag-drop-area").on("dragover", (e) => {
    let target = $(e.target);
    e.preventDefault();
    e.stopPropagation();
    target.addClass("dragover");
});

// Add a dragleave event listener to all elements with the class "drag-drop-area".
// Prevent the default dragleave behavior and remove the "dragover" class from the target element.
$(".drag-drop-area").on("dragleave", (e) => {
    let target = $(e.target);
    e.preventDefault();
    e.stopPropagation();
    target.removeClass("dragover");
});

// Add a drop event listener to all elements with the class "drag-drop-area".
// Prevent the default drop behavior, remove the "dragover" class from the target element, and handle the dropped file.
$(".drag-drop-area").on("drop", (e) => {
    let target = $(e.target);
    e.preventDefault();
    e.stopPropagation();
    target.removeClass("dragover");
    let file = e.originalEvent.dataTransfer.files[0];
    handleUploadedFile(file, target);
});

// Add a click event listener to all elements with the class "drag-drop-area".
// Create a new file input element, trigger a click event on it, and handle the selected file.
$(".drag-drop-area").on("click", (e) => {
    let target = $(e.currentTarget);
    let input = $(`<input type="file" accept="${target.attr("accept").replace(/\*/g, "")}">`);
    input.trigger("click");
    input.on("change", () => {
        let file = input.prop("files")[0];
        handleUploadedFile(file, target);
    });
});

// Define a function to handle uploaded files.
// Read the file as a data URL, remove the "dragover" class from the target element, and trigger an "upload" event with the file data.
function handleUploadedFile(file, target) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        target.removeClass("dragover");
        let content = atob(reader.result.split(";base64,").pop());
        target.trigger("upload", [
            {
                name: file.name,
                content: content,
                file: file,
            },
        ]);
    };
}

// For each element with the class "drag-drop-area", set its HTML content to display the accepted file types.
$(".drag-drop-area").each((_, element) => {
    let target = $(element);
    let acceptAttr = target.attr("accept");
    target.html(`<i>(${acceptAttr})</i>`);
});

// Add a click event listener to all elements with the class "popup" that do not have the class "no-close".
// If the user clicks anywhere on the popup's background, close the popup.
$(".popup:not(.no-close)").on("click", (e) => {
    // If the target of the click event is the active popup...
    if (e.target == $(".popup.active")[0]) {
        closePopup();
    }
});

// Add a click event listener to all elements with the class "close" within elements with the class "popup".
// If the user clicks the close button, close the popup.
$(".popup .close").on("click", () => closePopup());

// Add a click event listener to all "toggle" elements.
// When a "toggle" element is clicked, prevent the default click behavior and toggle its value.
$("toggle").on("click", (e) => {
    // Prevent the default click behavior.
    e.preventDefault();
    // Get the target of the click event.
    let target = $(e.target);
    // Get the current value of the "value" attribute of the target.
    let value = target.attr("value") === "true";
    // Set the "value" attribute of the target to the opposite of its current value.
    target.attr("value", !value);
    // Trigger a "toggle" event on the target with the new value.
    target.trigger("toggle", [{ value: !value }]);
});

/**
 * Closes the active popup.
 */
function closePopup() {
    // Get the active popup.
    let activePopup = $(".popup.active");
    // Remove the "active" class from the active popup to close it.
    activePopup.removeClass("active");
    // Remove the CSS overflow property from the body to allow scrolling.
    $("body").css("overflow", "");
    // Trigger a "close" event on the target of the click event.
    $(activePopup).trigger("close");
}

/**
 * Opens the popup with the specified id.
 * @param {string} id The id of the popup to open.
 */
function openPopup(id){
    // Sets the popup with the specified id to active.
    $(`#${id}`).addClass("active");
    // Sets the CSS overflow property of the body to hidden to prevent scrolling.
    $("body").css("overflow", "hidden");
}