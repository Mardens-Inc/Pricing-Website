import Voice from "./Voice.js";

let searchDebouncingTimeout = null;

const searchInput = $("#search");

searchInput.on('keyup', async (event) => {
    event.preventDefault();
    search(searchInput.val())
    if (event.key === "Enter") {
        searchInput.trigger("blur");
    }
});

$(document).on('keydown', e => {
    if (e.key === 'Escape') {
        searchInput.val('');
        search('');
    }
    if (e.currentTarget.activeElement.tagName === 'INPUT' || e.currentTarget.activeElement.tagName === 'TEXTAREA') return;
    // check if key was alphanumeric
    if (e.key.match(/^[a-zA-Z0-9]$/)) {
        searchInput.val("");
        searchInput.trigger('focus');
    }
})

$("#voice-search-button").on('click', () => {
    let voice = new Voice(/[^a-zA-Z0-9]/g);
    if (voice.unsupported) {
        alert(`Your browser does not support voice recognition`);
        return;
    }
    const button = $("#voice-search-button");
    if (button.hasClass("primary")) {
        button.removeClass("primary");
        voice.stop();
        return;
    }
    button.addClass("primary");
    $(voice).on("interim", async (event, transcript) => {
        console.log("Interim: " + transcript);
        search(transcript)
        searchInput.val(transcript)
    });
    $(voice).on("result", async (event, transcript) => {
        button.removeClass("primary");
        voice.stop();
    });
    $(voice).on("end", async (event) => {
        button.removeClass("primary");
        voice.stop();
    });

    voice.start();
})

export function search(query) {
    if (searchDebouncingTimeout !== null) {
        clearTimeout(searchDebouncingTimeout);
    }
    searchDebouncingTimeout = setTimeout(() => {
        searchDebouncingTimeout = null;
        $(document).trigger("search", [query]);
    }, 500);
}