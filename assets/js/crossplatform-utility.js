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


export {print, isDedicatedClient}