import Filemaker from "https://cdn.jsdelivr.net/gh/Mardens-Inc/Filemaker-API@e451a622f14ac3e5b7ff390be93e35f3377caafd/js/Filemaker.js";
import {startLoading, startLoadingForDuration, stopLoading, updateLoadingOptions} from "./loading.js";

const filemaker = new Filemaker("https://lib.mardens.com/fmutil", "admin", "19MRCC77!");

/**
 * Builds the import filemaker form.
 * @returns {Promise<JQuery>} The HTML element containing the form.
 */
async function buildImportFilemakerForm() {
    const html = $(await $.ajax({url: "assets/html/import-filemaker-form.html", method: "GET"}));
    await navigateToDatabaseList(html);
    return html;
}

/**
 * Navigates to the database list in the given HTML.
 *
 * @param {JQuery} html - The HTML object to navigate.
 *
 * @return {Promise<void>} - A promise that resolves once the navigation is complete.
 */
async function navigateToDatabaseList(html) {
    $(html).find("form").css("display", "none");
    $(html).find("#filemaker-databases").css("display", "");
    const databases = await filemaker.getDatabases();
    for (const database of databases) {
        const item = $(`
                <input type="radio" id="filemaker-database-${database}" name="filemaker-database" value="${database}">
                <label for="filemaker-database-${database}" class="list-item"><span class="title">${database.replace(/-/g, " ")}</span></label>
            `)
        html.find("#filemaker-databases > .col").append(item);
    }
    html.find("#filemaker-databases input").on('change', async (e) => {
        html.find("#filemaker-databases button[type='submit']").prop("disabled", false);
    });
    html.find("#filemaker-databases").on('submit', async (e) => {
        const database = html.find('input[name="filemaker-database"]:checked').val();
        if (database === undefined) {
            console.error("No database selected");
        } else {
            filemaker.withDatabase(database);
            await navigateToFilemakerLogin(html);
        }
    });
}

async function navigateToDatabaseImagesList(html) {
    $(html).find("form").css("display", "none");
    $(html).find("#databases-images").css("display", "");
    const json = await $.get(`${baseURL}/api/locations/images`);
    const parent = html.find("#databases-images .list");
    parent.html("");
    for (const item of json) {
        const name = item["name"];
        const file = item["file"];
        const url = item["url"];
        const listItem = $(`
                        <input type="radio" id="${file}" name="filemaker-image" value="${file}">
                        <label class="list-item" for="${file}">
                            <img src="${url}" alt="">
                            <span class="title">
                                <p>${name}</p>
                            </span>
                        </label>`);
        parent.append(listItem);
    }

    html.find("#databases-images input").on('change', async (e) => {
        html.find("#databases-images button[type='submit']").prop("disabled", false);
    });

    html.find("#databases-images").on('submit', async (e) => {
        const image = html.find('input[name="filemaker-image"]:checked').val();
        if (image === undefined) {
            console.error("No image selected");
        } else {
            await navigateToFilemakerLogin(html);
        }
    });
}

async function navigateToFilemakerLogin(html) {
    $(html).find("form").css("display", "none");
    $(html).find("#filemaker-credentials").css("display", "");


    html.find("#filemaker-credentials").on("submit", async (e) => {
        const username = html.find("#filemaker-username").val();
        const password = html.find("#filemaker-password").val();

        if (await filemaker.validateCredentials(username, password, filemaker.database)) {
            filemaker.withUsername(username);
            filemaker.withPassword(password);
            await navigateToDatabaseLayoutList(html);
        }
    });
}

async function navigateToDatabaseLayoutList(html) {
    $(html).find("form").css("display", "none");
    $(html).find("#filemaker-tables").css("display", "");
    const layouts = await filemaker.getLayouts();
    for (const layout of layouts) {
        const item = $(`
                <input type="radio" id="filemaker-layout-${layout}" name="filemaker-layout" value="${layout}">
                <label for="filemaker-layout-${layout}" class="list-item"><span class="title">${layout}</span></label>
            `)
        html.find("#filemaker-tables > .col").append(item);
    }
    html.find("#filemaker-tables input").on('change', async (e) => {
        html.find("#filemaker-tables button[type='submit']").prop("disabled", false);
    });
    html.find("#filemaker-tables").on('submit', async (e) => {
        const layout = html.find('input[name="filemaker-layout"]:checked').val();
        if (layout === undefined) {
            console.error("No layout selected");
        } else {
            filemaker.withLayout(layout);
            const json = JSON.stringify({
                database: filemaker.database,
                layout: filemaker.layout,
                username: filemaker.username,
                password: filemaker.password
            });
            startLoadingForDuration({
                message: "Importing data from filemaker, this can take multiple hours.<br>Please come back later!<br>You will be redirected to the home page in %duration% seconds.",
                fullscreen: true,
                color: "var(--primary)",
                speed: '500ms',
            }, 30, () => {
                window.localStorage.removeItem("loadedDatabase");
                window.location.reload();
            })
            $.ajax({url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/add/filemaker`, method: "POST", data: json, contentType: "application/json", headers: {accept: "application/json"}});
        }
    });
}


export {buildImportFilemakerForm}