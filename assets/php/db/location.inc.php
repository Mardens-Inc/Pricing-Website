<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";

use Hashids\Hashids;

/**
 * Handles the locations pricing database
 */
class Location
{
    private mysqli $connection;
    private Hashids $hashids;
    private string $id;

    public function __construct(string $id)
    {
        require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/connections.inc.php";
        $this->connection = DB_Connect::connect(); // Connect to locations database
        $this->hashids = new Hashids($_ENV["HASH_SALT"], 10);
        $this->id = $id;
    }

    /**
     * Add a location to the database
     * @param array $json The JSON data to add to the database
     * @return array An array containing the ID of the newly inserted location and whether the operation was successful
     */
    public function add(array $json): array
    {
        $keys = array_keys($json);
        $values = $json[$keys[0]]; // Assuming all arrays have the same length

        $sqls = [];
        $failed = 0;
        $inserted = 0;

        for ($i = 0; $i < count($values); $i++) {
            try {
                $insert_values = array();

                // Check if all values for the current iteration are blank
                $allBlank = true;
                foreach ($keys as $key) {
                    // Use isset to check if the key exists before accessing it
                    $value = $json[$key][$i] ?? null;
                    $value = trim($value);
                    $value = mysqli_real_escape_string($this->connection, $value);

                    $insert_values[] = "'" . $value . "'";
                    if (!empty($value)) {
                        $allBlank = false;
                    }
                }

                // Skip iteration if all values are blank
                if ($allBlank) {
                    continue;
                }

                $sql = "INSERT INTO `$this->id`(`" . implode('`, `', $keys) . "`) VALUES (" . implode(',', $insert_values) . ")";
                $sqls[] = $sql;
            } catch (Exception $e) {
                $failed++;
            }
        }

        foreach ($sqls as $sql) {
            try {

                $result = $this->connection->query($sql);
                if ($result) {
                    $inserted++;
                } else {
                    $failed++;
                }
            } catch (Exception $e) {
                echo $sql . "\n";
                $failed++;
            }
        }

        return ["inserted" => $inserted, "failed" => $failed];
    }


    /**
     * Edit a location in the database
     * @param array $json The JSON data to edit in the database
     * @return array An array containing the ID of the newly inserted location and whether the operation was successful
     */
    public function edit(array $json): array
    {
        // $id = $this->hashids->decode($id)[0];
        $itemId = $json["id"];
        $itemId = $this->hashids->decode($itemId)[0];
        unset($json["id"]);
        $sql = "UPDATE `$this->id` SET ";

        $keys = array_keys($json);
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            $value = $json[$key];
            $value = trim($value);
            $value = mysqli_real_escape_string($this->connection, $value);
            $sql .= "`$key` = '$value', ";
        }

        $sql = rtrim($sql, ", ");

        $sql .= " WHERE id = $itemId LIMIT 1";

        return ["success" => $this->connection->query($sql), "id" => $itemId];

    }


    /**
     * Gets a list of locations
     * @param int $max_count The maximum number of locations to return. 0 or blank for all locations
     * @param int $page The offset to start from, ie the page number
     * @param string $sort The column to sort by
     * @param bool $ascending Whether to sort ascending or descending
     * @param string $query The search query to filter by
     * @param array $searchColumns The columns to search in, leave blank to search in all columns
     * @return array An array of locations
     */
    public function list(int $max_count = 0, int $page = 0, string $sort = "", bool $ascending = true, string $query = "", array $searchColumns = []): array
    {
        // If max_count is 0, return all locations
        $sql = "SELECT * FROM `$this->id`";
        if (!empty($query)) {
            $columns = $this->getColumns($this->id);
            if (!$columns["success"]) {
                return ["success" => false, "error" => "Failed to get columns"];
            }
            $columns = empty($searchColumns) ? $columns["columns"] : $searchColumns;
            $sql .= " WHERE (";
            foreach ($columns as $column) {
                $sql .= "$column LIKE '%$query%' OR ";
            }
            $sql = rtrim($sql, "OR ");
            $sql .= ")";
        }
        if (!empty($sort)) {
            $sql .= " ORDER BY $sort";
            if ($ascending) {
                $sql .= " ASC";
            } else {
                $sql .= " DESC";
            }
        }

        if (!empty($max_count)) {
            // If max_count is not 0, return the specified number of locations and offset by the specified amount
            $page = $page * $max_count; // Offset is the page number * the max number of locations per page
            $sql .= " LIMIT $max_count OFFSET $page";
        }

        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database '$this->id'"]; // If the query failed, return an empty array
        }

        // Make an array of locations from the query results
        $locations = array();
        while ($row = $result->fetch_assoc()) {
            $row["id"] = $this->hashids->encode($row["id"]);
            array_push($locations, $row);
        }

        $count = 0;

        $sql = "SELECT COUNT(*) FROM `$this->id`";
        if (!empty($query)) {
            $columns = $this->getColumns($this->id);
            if (!$columns["success"]) {
                return ["success" => false, "error" => "Failed to get columns"];
            }
            $columns = $columns["columns"];
            $sql .= " WHERE (";
            foreach ($columns as $column) {
                $sql .= "$column LIKE '%$query%' OR ";
            }
            $sql = rtrim($sql, "OR ");
            $sql .= ")";
        }
        $result = $this->connection->query($sql);
        if ($result) {
            $count = $result->fetch_assoc()["COUNT(*)"];
        }

        return ["total_results" => $count, "max_count" => $max_count, "page" => $page, "success" => true, "items" => $locations];
    }

    /**
     * Gets the columns of a table in the database
     *
     * @return array An array with the keys "success" and "columns". If the "success" key is false, there was an error. If the "success" key is true, the "columns" key will contain an array with all the columns
     */
    public function getColumns(): array
    {
        try {

            // Send the query to the database
            $sql = "SHOW COLUMNS FROM `$this->id`";
            $result = $this->connection->query($sql);

            if ($this->connection->error)
                return ["success" => false, "error" => $this->connection->error];

            // If the query failed, return an empty array
            if (!$result) {
                return ["success" => false, "error" => "Failed to send query to database '$this->id'"];
            }

            // Get all the columns from the result
            $columns = [];
            while ($row = $result->fetch_assoc()) {
                $columns[] = $row["Field"];
            }

            // Return the columns
            return ["success" => true, "columns" => $columns];
        } catch (Exception $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    /**
     * Sets the columns of the "locations" table based on the given array
     *
     * @param array $columns An array containing the column names to be set
     * @return array An array containing the success status and error message if applicable
     */
    public function setColumns(array $columns): array
    {
        $currentColumns = $this->getColumns();
        if (!$currentColumns["success"]) {
            return ["success" => false, "error" => "Failed to get current columns"];
        }
        $currentColumns = $currentColumns["columns"];
        foreach ($columns as $column) {
            if ($column == "id" || $column == "date") continue;
            if (!in_array($column, $currentColumns)) {
                $sql = "ALTER TABLE `$this->id` ADD COLUMN `$column` TEXT";
                $result = $this->connection->query($sql);
                if (!$result) {
                    return ["success" => false, "error" => "Failed to add column '$column'"];
                }
            }
        }

        foreach ($currentColumns as $column) {
            if ($column == "id" || $column == "date") continue;
            if (!in_array($column, $columns)) {
                $sql = "ALTER TABLE `locations` DROP COLUMN `$column`";
                $result = $this->connection->query($sql);
                if (!$result) {
                    return ["success" => false, "error" => "Failed to remove column '$column'"];
                }
            }
        }
        return ["success" => true];
    }

    /**
     * Renames a column in a table
     *
     * @param string $oldName The name of the column to be renamed
     * @param string $newName The new name for the column
     * @return array An array containing the success status and error message if applicable
     */
    public function renameColumn(string $oldName, string $newName): array
    {
        $sql = "ALTER TABLE `$this->id` CHANGE COLUMN `$oldName` `$newName` TEXT";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to rename column '$oldName' to '$newName'"];
        }
        return ["success" => true];
    }

    /**
     * Imports records from FileMaker to the database.
     *
     * @param string $username The username for authentication with the FileMaker API.
     * @param string $password The password for authentication with the FileMaker API.
     * @param string $database The name of the FileMaker database.
     * @param string $layout The name of the FileMaker layout.
     * @return array An array containing the success status and error message if applicable.
     */
    public function importFromFilemaker(string $username, string $password, string $database, string $layout): array
    {
        $this->deleteAllRecords();
        $url = "https://lib.mardens.com/fmutil/databases/$database/layouts/$layout/records/all";
        $authHeader = "X-Authentication-Options:" . json_encode(["username" => $username, "password" => $password]);
        $stream_context = @stream_context_create([
            "http" => [
                "header" => $authHeader,
                "method" => "GET",
                "ignore_errors" => true
            ],
            "ssl" => [
                "verify_peer" => false,
                "verify_peer_name" => false
            ]
        ]);

        $response = @file_get_contents($url, false, $stream_context);
        try {
            $response = json_decode($response, true);
        } catch (Exception $e) {
            return ["success" => false, "error" => "Failed to parse json from the filemaker api", "message" => $e->getMessage()];
        }

        if (!$response) {
            return ["success" => false, "error" => "Failed to get response from filemaker api"];
        }

        $columns = $this->get_columns_from_filemaker($username, $password, $database, $layout);
        if (!$columns["success"]) {
            return ["success" => false, "error" => "Failed to get columns from filemaker"];
        }
        $columns = $columns["columns"];
        $this->setColumns($columns);
        $columns = implode(",", $columns);

        // create tmp directory if it doesn't exist
        if (!file_exists("{$_SERVER["DOCUMENT_ROOT"]}/tmp")) {
            mkdir("{$_SERVER["DOCUMENT_ROOT"]}/tmp");
        }

        $file = "{$_SERVER["DOCUMENT_ROOT"]}/tmp/$this->id.json";
        $log = "{$_SERVER["DOCUMENT_ROOT"]}/tmp/$this->id.log";

        file_put_contents($file, json_encode($response));

        require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/config.inc.php";
        global $DB_USER, $DB_PASSWORD, $DB_NAME;


        $command = $_SERVER["DOCUMENT_ROOT"] . "/exec/BulkImportSQL";
        $args = "-i \"$file\" -s localhost -d \"$DB_NAME\" -t \"$this->id\" -u \"$DB_USER\" -p \"$DB_PASSWORD\" -e fieldData -n -c \"$columns\"";

        // Determine the right command for the system's OS
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows
            $command .= ".exe";
            $command = "start /B $command $args > $log";
        } else {
            // Unix/Linux
            $command = "$command $args > $log 2>&1 &";
        }

        // Execute command
        exec($command);

        return ["success" => true];

    }

    private function get_columns_from_filemaker(string $username, string $password, string $database, string $layout): array
    {
        $url = "https://lib.mardens.com/fmutil/databases/$database/layouts/$layout/fields";
        $stream_context = stream_context_create([
            "http" => [
                "header" => "X-Authentication-Options:" . json_encode(["username" => $username, "password" => $password]),
                "method" => "GET",
                "ignore_errors" => true,
            ],
            // ignore ssl
            "ssl" => [
                "verify_peer" => false,
                "verify_peer_name" => false
            ]
        ]);

        $response = @file_get_contents($url, false, $stream_context);
        try {
            $response = json_decode($response, true);
        } catch (Exception $e) {
            return ["success" => false, "error" => "Failed to parse json from the filemaker api", "message" => $e->getMessage()];
        }

        if (!$response) {
            return ["success" => false, "error" => "Failed to get response from filemaker api"];
        }

        return ["success" => true, "columns" => $response];
    }


    /**
     * Deletes all records from a table
     * @return array An array containing the success status and error message if applicable
     */
    public function deleteAllRecords()
    {
        http_response_code(500);
        $sql = "truncate table `$this->id`";
        $this->connection->query($sql);
        if ($this->connection->error)
            return ["success" => false, "error" => $this->connection->error];
        $sql = "ALTER TABLE `$this->id` AUTO_INCREMENT = 1";
        $this->connection->query($sql);
        if ($this->connection->error)
            return ["success" => false, "error" => $this->connection->error];
        http_response_code(200);
        return ["success" => true];
    }

    /**
     * Delete a location price from the database
     * @param string $item The ID of the location to delete
     */
    public function delete(string $item): array
    {
        $item = $this->hashids->decode($item)[0];
        $sql = "DELETE FROM `$this->id` WHERE id = $item LIMIT 1";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database '$this->id'"];
        }
        return ["success" => true, "id" => $this->id];
    }

    public function export(mixed $format)
    {
        $sql = "SELECT * FROM `$this->id`";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database '$this->id'"];
        }

        $locations = array();
        while ($row = $result->fetch_assoc()) {
            $locations[] = $row;
        }

        switch ($format) {
            case "application/json":
                return json_encode($locations);
            case "application/csv":
                $csv = "";
                $columns = array_keys($locations[0]);
                $csv .= implode(",", $columns) . "\n";
                foreach ($locations as $location) {
                    $csv .= implode(",", $location) . "\n";
                }
                return $csv;
            case "application/xml":
                $xml = new SimpleXMLElement("<?xml version=\"1.0\"?><locations></locations>");
                array_walk_recursive($locations, array($xml, 'addChild'));
                return $xml->asXML();
            case "application/xlsx":
                $spreadsheet = new PhpOffice\PhpSpreadsheet\Spreadsheet();
                $sheet = $spreadsheet->getActiveSheet();
                $sheet->fromArray($locations, null, 'A1');
                $writer = new PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
                $file = tempnam(sys_get_temp_dir(), "locations");
                $writer->save($file);
                return $file;
            default:
                return ["success" => false, "error" => "Invalid format"];
        }
    }
}
