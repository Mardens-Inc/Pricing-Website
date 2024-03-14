/**
 * Downloads a file with the given filename and content.
 *
 * @param {string} filename - The name of the file to be downloaded.
 * @param {string} content - The content of the file.
 * @param {boolean} [saveAs=false] - A flag to indicate whether to prompt the user to save the file.
 *
 * @return {void}
 */
function download(filename, content, saveAs = false) {
    const blob = new Blob([content], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);

    const element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('download', filename);

    if (saveAs) {
        element.setAttribute('target', '_blank');
    }
    element.click();
}

export {download}