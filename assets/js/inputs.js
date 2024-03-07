$(document).on("load", () => {
    console.log("inputs.js loaded");
    $(`[toggle-hidden]`).each((_, element) => {
        let target = $(element);
        let toggle = $(`#${target.attr("toggle-hidden")}`);
        if (toggle.attr("value") === "true") {
            target.show();
        } else {
            target.hide();
        }
    });
    $("toggle").off("click"); // Remove any existing click event listeners.
    // Add a click event listener to all elements with the class "toggle".
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
        target.trigger("toggle", [{value: !value}]);

        // Toggles the visibility of the target element and the element with the id specified in the "toggle-hidden" attribute of the target.
        $(`[toggle-hidden="${target.attr("id")}"]`).toggle();
    });


    /**
     * Represents a draggable and droppable area.
     *
     * @type {JQuery}
     */
    const dragDropArea = $(".drag-drop-area");

    // Add a dragover event listener to all elements with the class "drag-drop-area".
    // Prevent the default dragover behavior and add the "dragover" class to the target element.
    dragDropArea.on("dragover", (e) => {
        let target = $(e.target);
        e.preventDefault();
        e.stopPropagation();
        target.addClass("dragover");
    });

    // Add a dragleave event listener to all elements with the class "drag-drop-area".
    // Prevent the default dragleave behavior and remove the "dragover" class from the target element.
    dragDropArea.on("dragleave", (e) => {
        let target = $(e.target);
        e.preventDefault();
        e.stopPropagation();
        target.removeClass("dragover");
    });

    // Add a drop event listener to all elements with the class "drag-drop-area".
    // Prevent the default drop behavior, remove the "dragover" class from the target element, and handle the dropped file.
    dragDropArea.on("drop", (e) => {
        let target = $(e.target);
        e.preventDefault();
        e.stopPropagation();
        target.removeClass("dragover");
        let file = e.originalEvent.dataTransfer.files[0];
        handleUploadedFile(file, target);
    });

    // Add a click event listener to all elements with the class "drag-drop-area".
    // Create a new file input element, trigger a click event on it, and handle the selected file.
    dragDropArea.on("click", (e) => {
        let target = $(e.currentTarget);
        let input = $(`<input type="file" accept="${target.attr("accept").replace(/\*/g, "")}">`);
        input.trigger("click");
        input.on("change", () => {
            let file = input.prop("files")[0];
            handleUploadedFile(file, target);
        });
    });

    // For each element with the class "drag-drop-area", set its HTML content to display the accepted file types.
    dragDropArea.each((_, element) => {
        let target = $(element);
        let acceptAttr = target.attr("accept");
        target.html(`<i>(${acceptAttr})</i>`);
    });


    /**
     * Handles the uploaded file by reading its content and triggering an "upload" event.
     * Removes the "dragover" class from the target element.
     *
     * @param {File} file - The uploaded file.
     * @param {JQuery} target - The target element where the "dragover" class should be removed.
     *
     * @return {void}
     */
    function handleUploadedFile(file, target) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            target.removeClass("dragover");
            let content = atob(reader.result.split(";base64,").pop());
            target.trigger("upload", [{
                name: file.name, content: content, file: file,
            },]);
        };
    }


})