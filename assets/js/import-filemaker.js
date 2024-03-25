import Filemaker from "https://cdn.jsdelivr.net/gh/Mardens-Inc/Filemaker-API@8b2058fa149e11278487d0cadd3d2b33f37691e3/js/Filemaker.js";
import {startLoading, stopLoading, updateLoadingOptions} from "./loading.js";
import {addRecord} from "./location.js";

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
 * @param {JQuery<HTMLElement>} html - The HTML object to navigate.
 *
 * @return {Promise<void>} - A promise that resolves once the navigation is complete.
 */
async function navigateToDatabaseList(html) {
    $(html).find("form").css("display", "none");
    $(html).find("#filemaker-databases").css("display", "");
    const databases = await filemaker.getDatabases();
    buildView(databases);

    function buildView(data) {
        for (const database of data) {
            const item = $(`
                <input type="radio" id="filemaker-database-${database}" name="filemaker-database" value="${database}">
                <label for="filemaker-database-${database}" class="list-item"><span class="title">${database.replace(/-/g, " ")}</span></label>
            `)
            html.find("#filemaker-databases > .col").append(item);
        }

        html.find("#filemaker-databases input").on('change', async (e) => {
            html.find("#filemaker-databases button[type='submit']").prop("disabled", false);
        });
    }

    html.find("#filemaker-databases").on('submit', async (e) => {
        const database = html.find('input[name="filemaker-database"]:checked').val();
        if (database === undefined) {
            console.error("No database selected");
        } else {
            $(document).off('search'); // remove event listener for search on the document
            filemaker.withDatabase(database);
            await navigateToFilemakerLogin(html);
        }
    });
    $(document).on('search', (event, data) => {
        html.find("#filemaker-databases > .col").html("");
        if (data === "") {
            buildView(databases);
            return;
        }
        const filtered = databases.filter(database => database.toLowerCase().includes(data.toLowerCase()));
        buildView(filtered);
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
    html.find('p.error').text("");

    if (await attemptAdminCredentials()) {
        await navigateToDatabaseLayoutList(html);
        return;
    }


    html.find("#filemaker-credentials").on("submit", async (e) => {
        html.find('p.error').text("");
        const username = html.find("#filemaker-username").val();
        const password = html.find("#filemaker-password").val();


        const response = await filemaker.validateCredentials(username, password, filemaker.database);
        console.log(response)
        if (response["success"] !== undefined && response["success"] === true) {
            filemaker.withUsername(username);
            filemaker.withPassword(password);
            await navigateToDatabaseLayoutList(html);
        } else {
            console.error(`Error: ${response["message"]}`);
            html.find('p.error').text(response["message"]);
        }
    });
}

async function attemptAdminCredentials() {
    const response = await filemaker.validateCredentials("admin", "19MRCC77!", filemaker.database);
    if (response["success"] !== undefined && response["success"] === true) {
        filemaker.withUsername("admin");
        filemaker.withPassword("19MRCC77!");
        return true;
    } else {
        return false;
    }

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
            startLoading(
                {
                    message: "Importing data from filemaker, Please wait!<br>This can take some time.",
                    fullscreen: true,
                })
            try {
                await push();
                // const response = await $.ajax({url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/add/filemaker`, method: "POST", timeout: 30000, data: json, contentType: "application/json", headers: {accept: "application/json"}});
                // setTimeout(() => {
                //     if (response["success"] !== undefined && response["success"] === true)
                //         window.location.reload();
                // }, 3000)
            } catch (e) {
                console.error("Unable to push data from filemaker to server")
                console.error(e)
                updateLoadingOptions({
                    message: `An error has occurred while uploading data from filemaker.<br>Please contact support.`,
                    fullscreen: true,
                })

            }
        }
    });
}

/**
 * Pushes data from FileMaker to the server.
 *
 * @async
 * @function push
 * @returns {Promise<void>} - A promise that resolves when the data has been successfully pushed or rejects if an error occurs.
 */
async function push() {

    await setColumns();

    const count = await filemaker.getRecordCount();
    let currentProcessed = 0;
    let size = 1_000;

    let itemsPerSecond = 0;
    let start = new Date().getTime();
    let countDown = 0;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let allItemsPerSecond = [];
    let i = 0;

    const calculateETA = () => {
        // average the items per second
        const averageItemsPerSecond = allItemsPerSecond.reduce((a, b) => a + b, 0) / allItemsPerSecond.length;
        console.log(`Average items per second: ${averageItemsPerSecond}`)

        // calculate eta based on the items per second
        const eta = (count - i) / averageItemsPerSecond;

        // format time as 00hr 00m 00s
        hours = Math.floor(eta / 3600);
        minutes = Math.floor((eta % 3600) / 60);
        seconds = Math.floor(eta % 60);
    }

    setInterval(calculateETA, 10000)

    countDown = setInterval(() => {
        seconds--; // decrement the seconds
        if (seconds < 0) { // if seconds is less than 0
            seconds = 59; // set seconds to 59
            minutes--; // decrement minutes
            if (minutes < 0) { // if minutes is less than 0
                minutes = 59; // set minutes to 59
                hours--; // decrement hours
                if (hours < 0) { // if hours is less than 0
                    hours = 0; // set hours to 0
                    minutes = 0; // set minutes to 0
                    seconds = 0; // set seconds to 0
                }
            }
        }

        // format time as 00hr 00m 00s
        let etaFormatted = "";
        if (hours > 0)
            etaFormatted += `${hours}hr `;
        if (minutes > 0)
            etaFormatted += `${minutes}m `;
        etaFormatted += `${Math.ceil(seconds)}s`;

        // update the loading message
        updateLoadingOptions({
            message: `Importing data from filemaker, Please wait!<br>Records ${currentProcessed} of ${count}<br>ETA: ${etaFormatted}`,
            fullscreen: true,
        })
    }, 1000)

    for (i = 0; i < count; i += size) {
        // get the records from filemaker
        const records = (await filemaker.getRecords(size, i > count ? count : i))
            .map(record => {
                    let records = record.fields
                    // remove keys that start with g_ (filemaker internal fields)
                    for (const key in records) {
                        if (key.startsWith("g_")) {
                            delete records[key];
                        }
                    }
                    const data = {...records};
                    // if the records have an "id" field, rename it to "identifier" and if the records have a "date" field, rename it to "fm_date"
                    for (const key in data) {
                        if (key.toLowerCase() === "id") {
                            data["identifier"] = data[key];
                            records["identifier"] = records[key];
                            delete data[key];
                            delete records[key];
                        }
                        if (key.toLowerCase() === "date") {
                            data["fm_date"] = data[key];
                            records["fm_date"] = records[key];
                            delete data[key];
                            delete records[key];
                        }
                    }
                    return records;
                }
            )

        try {
            // upload the data to the server
            await addRecord(records);
        } catch (e) {
            console.log(e)
            clearInterval(countDown); // clear the countdown interval

            // if an error occurs, update the loading message and return
            updateLoadingOptions({
                message: `An error has occurred while uploading data from filemaker.<br>Please contact support.`,
                fullscreen: true,
            })

            return;
        }
        // calculate items per second
        const time = new Date().getTime();
        itemsPerSecond = (size / ((time - start) / 1000));
        start = time;

        allItemsPerSecond.push(itemsPerSecond);

        // update the current processed records
        currentProcessed += records.length;

        if (i < 2) calculateETA();
    }


    clearInterval(countDown); // clear the countdown interval
    stopLoading(); // stop the loading screen
    window.location.reload(); // reload the page

}

/**
 * Fetches rows from filemaker and updates the columns in the specified location's database using AJAX PATCH request.
 *
 * @returns {Promise<void>} A promise that resolves when the columns are updated successfully.
 */
async function setColumns() {
    let columns = await filemaker.getRows();
    columns = columns.filter(row => !row.startsWith("g_")).map(c => c.toLowerCase() === "id" ? "identifier" : c.toLowerCase() === "date" ? "fm_date" : c);
    console.log(columns);
    const json = JSON.stringify(columns);
    await $.ajax({
        url: `${baseURL}/api/location/${window.localStorage.getItem("loadedDatabase")}/columns`,
        method: "PATCH",
        data: json,
        contentType: "application/json",
        headers: {accept: "application/json"}
    })
}


export {buildImportFilemakerForm}