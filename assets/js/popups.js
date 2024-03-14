/**
 * Opens a popup with the specified name and data.
 *
 * @param {string} name - The name of the popup.
 * @param {Object} [data] - Optional data for the popup.
 * @return {Promise<JQuery<HTMLElement>|HTMLElement>} - A promise that is resolved when the popup is opened.
 */
async function openPopup(name, data = {}) {
    const html = await $.get(`assets/popups/${name}.html`);
    name = name.replace(/[^a-zA-Z]/g, "");
    let popup = $(`<div class='popup' id="${name}-popup">`);
    const popupContent = $(`<div class='popup-content'>${html}</div>`);
    popupContent.append(`<button class="close"><i class="fa fa-close"></i></button>`)
    const bg = $('<div class="close popup-bg"></div>')
    bg.on("click", () => {
        closePopup(name);
    });

    popup.append(bg);
    popup.append(popupContent);

    popup.appendTo("body");
    setTimeout(() => {
        popup.addClass("active");
        popup.find(".close").on("click", () => {
            closePopup(name);
        });
    }, 100)

    $(document).trigger("loadPopup", {data})

    return popup;
}

/**
 * Close the specified popup by removing the "active" class and removing it from the DOM after a delay.
 * @param {string} name - The name of the popup to close.
 * @return {void} - A promise that resolves after the popup has been closed.
 */
function closePopup(name) {
    const popup = $(`#${name}-popup.popup.active`);
    popup.removeClass("active");
    setTimeout(() => {
        popup.remove();
    }, 300)
}

/**
 * Display an alert popup with the given message.
 *
 * @param {string} message - The message to be displayed in the alert popup.
 * @param {function=} onclose - Optional callback function to be executed when the alert popup is closed.
 * @param {function=} onOk - Optional callback function to be executed when the "OK" button is clicked.
 */
function alert(message, onclose = null, onOk = null) {
    let popup = $(`<div id="alert-popup" class='popup'>`);
    const popupContent = $(`<div class='popup-content'>`);

    popupContent.append(`<h1>Alert</h1>`)
    popupContent.append(`<p>${message}</p>`)
    const buttons = $(`<div class="row">`);
    if (onOk) {
        const okButton = $(`<button class="primary fill">OK</button>`);
        buttons.append(okButton)
        okButton.on("click", () => {
            closePopup("alert");
            onOk();
        });
    }
    const closeButton = $(`<button class="fill">${onOk === null ? "Close" : "Cancel"}</button>`);
    buttons.append(closeButton)
    closeButton.on("click", () => {
        closePopup("alert");
        if (onclose) {
            onclose();
        }
    });

    const bg = $('<div class="close popup-bg"></div>')
    popup.append(popupContent);
    popup.append(bg);
    popupContent.append(buttons);
    popup.appendTo("body");
    setTimeout(() => {
        popup.addClass("active");

        popup.find(".close").on("click", () => {
            closePopup("alert");
            if (onclose) {
                onclose();
            }
        });
    }, 100)
}

/**
 * Displays a confirmation popup with a message and two buttons.
 *
 * @param {string} message - The message to display in the popup.
 * @param {string} [yes="Yes"] - The text to display on the "Yes" button.
 * @param {string} [no="No"] - The text to display on the "No" button.
 * @param {(boolean)=>{}} [submit=null] - Optional callback function to execute when a button is clicked.
 *                                   The function will be called with a single boolean parameter indicating
 *                                   whether the "Yes" or "No" button was clicked.
 * @return {void}
 */
function confirm(message, yes = "Yes", no = "No", submit = null) {
    let popup = $(`<div id="confirm-popup" class='popup'>`);
    const popupContent = $(`<div class='popup-content'>`);
    popupContent.append(`<h1>Confirm</h1>`)
    popupContent.append(`<p>${message}</p>`)
    const buttons = $(`<div class="row">`);
    const okButton = $(`<button class="primary fill">${yes}</button>`);
    buttons.append(okButton)
    okButton.on("click", () => {
        closePopup("confirm");
        if (submit) {
            submit(true);
        }
    });
    const closeButton = $(`<button class="fill">${no}</button>`);
    closeButton.on("click", () => {
        closePopup("confirm");
        if (submit) {
            submit(false);
        }
    });
    buttons.append(closeButton)

    const bg = $('<div class="close popup-bg"></div>')
    popup.append(popupContent);
    popup.append(bg);
    popupContent.append(buttons);
    popup.appendTo("body");
    setTimeout(() => {
        popup.addClass("active");

        popup.find(".close").on("click", () => {
            closePopup("confirm");
            if (submit) {
                submit(false);
            }
        });
    }, 100)

}

export {openPopup, closePopup, alert, confirm};