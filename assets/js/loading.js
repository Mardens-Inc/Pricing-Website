/**
 * Represents the default options for loading screen.
 * @type {Object}
 * @property {string} message - The default loading message.
 * @property {boolean} fullscreen - Indicates whether the loading screen should cover the entire screen.
 * @property {string} size - The default size of the loading screen. Can be any valid CSS size value.
 * @property {string} font - The default font size of the loading screen message. Can be any valid CSS font size value.
 * @property {string} color - The default color of the loading screen message. Can be any valid CSS color value.
 * @property {string} speed - The default speed of the loading animation. Can be any valid CSS animation duration value.
 */
let defaultOptions = {
    message: "",
    fullscreen: true,
    size: '100px',
    font: '2rem',
    color: "var(--primary)",
    speed: '1s',
};

/**
 * Starts the loading animation with the specified options.
 *
 * @param {Object} [options=defaultOptions] - The options for the loading animation.
 * @param {string} [options.message="Loading..."] - The message to be displayed inside the loading animation.
 * @param {boolean} [options.fullscreen=false] - Indicates whether the loading animation should be fullscreen or not.
 * @param {string} [options.size] - The size of the loading animation element. Should be a valid CSS value.
 * @param {string} [options.color] - The color of the loading animation element. Should be a valid CSS color value.
 * @param {string} [options.speed] - The speed of the loading animation. Should be a valid CSS animation duration value.
 * @param {string} [options.font] - The font size of the loading animation element. Should be a valid CSS font size value.
 *
 * @return {void}
 */
function startLoading(options = defaultOptions) {

    // Set default options if not provided
    options = populateMissingWithDefaultOptions(options);

    if ($("link[href='assets/css/loading.css']").length === 0) $("head").append($("<link rel='stylesheet' href='assets/css/loading.css'>"));
    if ($(".loading").length > 0) return;
    const loading = $(`<div class="loading"><p class="message">${options.message}</p></div>`);
    if (options.fullscreen) loading.addClass("fullscreen");
    loading.prop({style: `--size: ${options.size}; --color: ${options.color}; --speed: ${options.speed}; --font: ${options.font}`});

    $("body").append(loading);
}

/**
 * Updates the loading options based on the given options object.
 *
 * @param {Object} options - The options object to update the loading options.
 * @property {string} size - The size of the loading element.
 * @property {string} color - The color of the loading element.
 * @property {number} speed - The speed of the loading animation.
 * @property {string} font - The font of the loading message.
 * @property {string} message - The message to display in the loading element.
 * @property {boolean} fullscreen - Specifies whether to display the loading element in fullscreen mode.
 *
 * @return {undefined}
 */
function updateLoadingOptions(options) {
    options = populateMissingWithDefaultOptions(options);

    const loading = $(".loading");
    loading.prop({style: `--size: ${options.size}; --color: ${options.color}; --speed: ${options.speed}; --font: ${options.font}`});
    loading.html(`<p class="message">${options.message}</p>`)
    if (options.fullscreen) loading.addClass("fullscreen");
    else loading.removeClass("fullscreen");
}

/**
 * Starts the loading process for a given duration.
 *
 * @param {Object} options - The loading options.
 * @param {string} options.message - The loading message with %duration% as placeholder.
 * @param {any} options.otherProperty - Other properties specific to the loading process.
 * @param {number} duration - The duration in seconds for which the loading process should run.
 * @param {function} [callback=null] - Optional callback function to be called after the loading process completes.
 *
 * @return {void}
 */
function startLoadingForDuration(options, duration, callback = null) {
    startLoading(options);
    const originalMessage = options.message;
    const update = () => {
        options.message = originalMessage.replace(/%duration%/g, duration.toString());
        updateLoadingOptions(options);
        if (duration <= 0) {
            clearInterval(interval);
            stopLoading();
            if (callback !== null) callback();
        }
        console.log(`Updating: ${duration}`)
    }
    update();
    const interval = setInterval(() => {
        duration--;
        update();
    }, 1000)
}

/**
 * Populates missing options with default options.
 *
 * @param {object} options - The options object to populate.
 * @property {number} [options.size] - The size option.
 * @property {string} [options.color] - The color option.
 * @property {number} [options.speed] - The speed option.
 * @property {string} [options.font] - The font option.
 * @property {string} [options.message] - The message option.
 * @property {boolean} [options.fullscreen] - The fullscreen option.
 *
 * @return {object} - The options object with missing options populated.
 */
function populateMissingWithDefaultOptions(options) {
    options.size = options.size || defaultOptions.size;
    options.color = options.color || defaultOptions.color;
    options.speed = options.speed || defaultOptions.speed;
    options.font = options.font || defaultOptions.font;
    options.message = options.message || defaultOptions.message;
    options.fullscreen = options.fullscreen || defaultOptions.fullscreen;

    return options;
}

/**
 * Removes the loading element from the DOM.
 *
 * @returns {void}
 */
function stopLoading() {
    $(".loading").remove();
}

export {startLoading, stopLoading, updateLoadingOptions, startLoadingForDuration}