class Parser {
    /**
     * Converts an excel file into a CSV string
     * @param {string} excel The excel file to convert
     * @returns {string} The CSV string
     */
    static ExcelToCSV(excel) {
        try {
            const workbook = XLSX.read(excel, { type: "binary" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const csvData = XLSX.utils.sheet_to_csv(sheet);
            return csvData.replace(/,+/g, ",");
        } catch {
            alert("Unable to parse excel file, This usually means that the file is not in the correct format and needs to be cleaned/modified.");
            return "";
        }
    }

    /**
     * Converts a CSV string into a JSON object
     * @param {string} csv
     * @returns {JSON} The data parsed from the CSV
     */
    static CSVToJSON(csv) {
        csv = csv.replace(/"([^"]*)"/g, (match, p1) => p1.replace(/,/g, ""));
        try {
            let lines = csv.split("\n");
            let headers = lines[0].split(",");

            // Create an empty object to hold our data
            let json = "{";
            headers.forEach((header) => {
                if (header != "") json += `"${header.trim().toLowerCase().replace(/\s/g, "_").replace(/\"/g, "")}":[],`;
            });

            // Remove the last comma and add the closing brace
            json = json.substring(0, json.length - 1);
            json += "}";

            // Parse the json into an object
            let data = JSON.parse(json);

            // Loop through the lines of the CSV
            for (let i = 1; i < lines.length; i++) {
                let line = lines[i];
                let values = line.split(",");
                // Loop through each column of the CSV
                for (let j = 0; j < values.length; j++) {
                    let value = values[j];
                    let header = headers[j];

                    if (header == undefined || header == "") continue;

                    // Add the value to the correct array
                    data[header.trim().toLowerCase().replace(/\s/g, "_")].push(value);
                }
            }

            return data;
        } catch {
            alert("Unable to parse file, This usually means that the file is not in the correct format and needs to be cleaned/modified.");
            return "";
        }
    }
}
