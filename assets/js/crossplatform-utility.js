const isDedicatedClient = window.__TAURI__;

/**
 * Print data to a printer
 * @param {RecordPrintData} data
 */
function print(data) {
    console.log(data);
    const printWindow = window.open('', 'PRINT', 'height=400,width=600');

    let bodyHtml = "";
    if (data.department) {
        bodyHtml += `<div class="dpt">${data.department}</div>`;
    }
    bodyHtml += `<div class="label">${data.label}</div>`;
    if (data.retail) {
        bodyHtml += `<div class="${data.mp ? "rp" : "mp"}">${data.retail}</div>`;
    }
    if (data.mp) {
        bodyHtml += `<div class="mp">${data.mp}</div>`;
    }
    bodyHtml += `<div class="year">${data.year}</div>`;

    const pageHtml = `<html lang="en">
                        <head>
                            <title>Print</title>
                            <link rel="stylesheet" href="assets/css/printer.css">
                        </head>
                        <body size="${data.size}">
                            <div id="box">
                                ${bodyHtml}
                            </div>
                        </body>
                    </html>`;

    console.log(pageHtml);
    printWindow.document.write(pageHtml);
    setTimeout(() => {
        try {
            printWindow.print();
        } catch (e) {
            console.error(e);
        }
        printWindow.close();
    }, 100)
}


/**
 * Returns the operating system based on the user agent.
 *
 * @returns {string} The operating system.
 */
const getOperatingSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor;

    if (/windows phone/i.test(userAgent)) return 'WindowsPhone';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iPad|iPhone|iPod/.test(userAgent)) return 'IOS';
    if (/Win32|Win64|wow32|wow64/.test(userAgent)) return 'Windows';
    if (/Linux|X11/.test(userAgent)) return 'Linux';
    if (/Mac|Intel/.test(userAgent)) return 'MacOS';

    // Fallback to a desktop version if the OS is not identified
    return 'Desktop';
};

/**
 * The operating system of the user.
 *
 * @namespace window.os
 */
window.os = getOperatingSystem();


export {print, isDedicatedClient, getOperatingSystem}