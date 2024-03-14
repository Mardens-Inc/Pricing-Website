import {isDedicatedClient} from "./crossplatform-utility.js";
import {startLoading, stopLoading} from "./loading.js";

/**
 * @typedef {Object} Settings
 * @property {string} selected_printer
 */


/**
 * Open the settings page
 * @returns {Promise<void>}
 */
async function openSettings() {
    if (!isDedicatedClient) return;
    startLoading({fullscreen: true})
    const list = $("main")
    list.empty();
    let html = $(await $.get("assets/html/settings.html"));
    const settings = await loadSettings();

    html = await buildSelectPrintersSection(html, settings);


    list.append(html);
    stopLoading();
}

async function buildSelectPrintersSection(html, settings) {
    if (!isDedicatedClient) return;
    const selectedPrintersElement = html.find("#selected-printer");
    const dropdownButton = html.find("button");
    const value = html.find(".value");
    console.log(settings.selected_printer)
    if (settings.selected_printer === "") {
        console.log("No printer selected")
        value.text("No printer selected");
    } else {
        value.text(settings.selected_printer);
    }

    const printers = await getPrinters();

    dropdownButton.on('click', async () => {
        // map printers to an action object
        let actions = {}
        for (let printer of printers) {
            actions[printer] = async () => {
                settings.selected_printer = printer;
                value.text(printer);
                await saveSettings(settings);
            }
        }
        openDropdown(dropdownButton, actions);
    })

    return html;
}

/**
 * Load settings from the backend
 * @returns {Promise<Settings>}
 */
async function loadSettings() {
    if (!isDedicatedClient) return null;
    const settings = await window.__TAURI__.invoke("load");
    console.log(settings);
    window.localStorage.setItem("settings", JSON.stringify(settings));
    return settings;
}

/**
 *  Returns an array of printers.
 *
 *  @returns {Promise<string[]>} - A promise that resolves to an array of printers.
 */
async function getPrinters() {
    if (!isDedicatedClient) return [];
    const printers = await window.__TAURI__.invoke("get_printers");
    console.log(printers);
    return printers;
}

async function saveSettings(settings) {
    if (!isDedicatedClient) return;
    await window.__TAURI__.invoke("save", {config: settings});
    window.localStorage.setItem("settings", JSON.stringify(settings));
}


export {openSettings, loadSettings}