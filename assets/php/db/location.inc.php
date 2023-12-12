<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";

use Hashids\Hashids;

/**
 * Handles the locations pricing database
 */
class Location
{
    private $connection;
    private $hashids;
    public function __construct()
    {
        require_once $_SERVER["DOCUMENT_ROOT"] .  "/assets/php/connections.inc.php";
        $this->connection = DB_Connect::connect(); // Connect to locations database
        if (!$this->connection) {
            die($this->connection->error);
        }
        $this->hashids = new Hashids($_ENV["HASH_SALT"], 10);
    }

    /**
     * Add a location to the database
     * @param string $id The ID of the location to add the pricing to
     * @param array $json The JSON data to add to the database
     * @return array An array containing the ID of the newly inserted location and whether the operation was successful
     */
    public function add(string $id, array $json): array
    {
        $keys = array_keys($json);
        $values = $json[$keys[0]]; // Assuming all arrays have the same length

        $sqls = array();
        $failed = 0;
        $inserted = 0;

        for ($i = 0; $i < count($values); $i++) {
            try {
                $insert_values = array();

                // Check if all values for the current iteration are blank
                $allBlank = true;
                foreach ($keys as $key) {
                    // Use isset to check if the key exists before accessing it
                    $value = isset($json[$key][$i]) ? $json[$key][$i] : null;
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

                $sql = "INSERT INTO `$id`(`" . implode('`, `', $keys) . "`) VALUES (" . implode(',', $insert_values) . ")";
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
     * @param string $id The ID of the location to edit the pricing of
     * @param array $json The JSON data to edit in the database
     * @return array An array containing the ID of the newly inserted location and whether the operation was successful
     */
    public function edit(string $id, array $json): array
    {
        // $id = $this->hashids->decode($id)[0];
        $itemId = $json["id"];
        $itemId = $this->hashids->decode($itemId)[0];
        unset($json["id"]);
        $sql = "UPDATE `$id` SET ";

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
     * @param int $id The ID of the location to get the pricing from
     * @param int $max_count The maximum number of locations to return. 0 or blank for all locations
     * @param int $page The offset to start from, ie the page number
     * @param string $sort The column to sort by
     * @param bool $ascending Whether to sort ascending or descending
     * @param string $query The search query to filter by
     * @return array An array of locations
     */
    public function list(string $id, int $max_count = 0, int $page = 0, string $sort = "", bool $ascending = true, string $query = ""): array
    {
        // If max_count is 0, return all locations
        $sql = "SELECT * FROM `$id`";
        if (!empty($query)) {
            $columns = $this->getColumns($id);
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
            return ["success" => false, "error" => "Failed to send query to database '$id'"]; // If the query failed, return an empty array
        }

        // Make an array of locations from the query results
        $locations = array();
        while ($row = $result->fetch_assoc()) {
            $row["id"] = $this->hashids->encode($row["id"]);
            array_push($locations, $row);
        }

        $count = 0;

        $sql = "SELECT COUNT(*) FROM `$id`";
        if (!empty($query)) {
            $columns = $this->getColumns($id);
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
     * @param string $id The id of the table to get the columns of
     *
     * @return array An array with the keys "success" and "columns". If the "success" key is false, there was an error. If the "success" key is true, the "columns" key will contain an array with all the columns
     */
    public function getColumns(string $id): array
    {
        try {

            // Send the query to the database
            $sql = "SHOW COLUMNS FROM `$id`";
            $result = $this->connection->query($sql);

            if ($this->connection->error)
                return ["success" => false, "error" => $this->connection->error];

            // If the query failed, return an empty array
            if (!$result) {
                return ["success" => false, "error" => "Failed to send query to database '$id'"];
            }

            // Get all the columns from the result
            $columns = [];
            while ($row = $result->fetch_assoc()) {
                array_push($columns, $row["Field"]);
            }

            // Return the columns
            return ["success" => true, "columns" => $columns];
        } catch (Exception $e) {
            return ["success" => false, "error" => $e->getMessage()];
        }
    }

    /**
     * Deletes all records from a table
     * @param string $id The ID of the table to delete all records from
     * @return array An array containing the success status and error message if applicable
     */
    public function deleteAllRecords(string $id)
    {
        http_response_code(500);
        $sql = "truncate table `$id`";
        $this->connection->query($sql);
        if ($this->connection->error)
            return ["success" => false, "error" => $this->connection->error];
        $sql = "ALTER TABLE `$id` AUTO_INCREMENT = 1";
        $this->connection->query($sql);
        if ($this->connection->error)
            return ["success" => false, "error" => $this->connection->error];
        http_response_code(200);
        return ["success" => true];
    }

    /**
     * Delete a location price from the database
     * @param int $id The ID of the location price to delete
     */
    public function delete(string $id, string $item): array
    {
        $item = $this->hashids->decode($item)[0];
        $sql = "DELETE FROM `$id` WHERE id = $item LIMIT 1";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database '$id'"];
        }
        return ["success" => true, "id" => $id];
    }
}
