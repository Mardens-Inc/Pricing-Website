import DatabaseList from "./database-list.js";
import DirectoryList from "./directory-list.js";
import {startLoading, stopLoading} from "./loading.js";
import {loadSettings, openSettings} from "./settings.js";

loadSettings();

const list = $("main > .list")
resetListElement()
const editButton = $("#edit-button");

$("#settings-button").on("click", async () => {
    await openSettings();
});


editButton.css('display', 'none');
const directory = new DirectoryList();
/**
 * @type {DatabaseList|null}
 */
let database = null;
if (window.localStorage.getItem("loadedDatabase") !== null) {
    database = new DatabaseList(window.localStorage.getItem("loadedDatabase"));
    await database.load();
    editButton.css('display', "");
} else {
    startLoading({fullscreen: true})
    directory.loadView("", true).then(() => stopLoading())
        // .then(async()=>{
        //     await openSettings();
        // });
}
$(directory).on("loadExternalView", async (event, id) => {
    resetListElement()
    database = new DatabaseList(id);
    await database.load();
    window.localStorage.setItem("loadedDatabase", id);
    editButton.css('display', "");
});
$(directory).on('loadEdit', async (event, id) => {
    resetListElement()
    database = new DatabaseList(id);
    await database.load();
    window.localStorage.setItem("loadedDatabase", id);
    editButton.css('display', "");
    await database.edit();
});
$(directory).on("unloadExternalView", (event, id) => {
    resetListElement()
    database = null;
    editButton.css('display', 'none');
    window.localStorage.removeItem("loadedDatabase");
});
$(document).on("search", async (event, data) => {
    resetListElement()
    if (database !== null) {
        await database.search(data);
    } else {
        await directory.search(data);
    }
});

editButton.on("click", async () => {
    resetListElement()
    if (database !== null) {
        await database.edit();
    }
});

function resetListElement() {
    if (list.hasClass("row")) {
        list.addClass('col')
        list.removeClass('row')
    }
}