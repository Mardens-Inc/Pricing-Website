<?php

use Hashids\Hashids;

enum ActionType: int
{
    case CREATE = 0;
    case UPDATE = 1;
    case DELETE = 2;
}

class History
{
    private mysqli $conn;
    private Hashids $hashids;

    function __construct()
    {
        require_once $_SERVER['DOCUMENT_ROOT'] . "/assets/php/connections.inc.php";
        $this->conn = DB_Connect::connect();
        $this->hashids = new Hashids($_ENV["HASH_SALT"], 10);

        $sql = "CREATE TABLE IF NOT EXISTS history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            location_id VARCHAR(11) NOT NULL,
            record_id VARCHAR(11) NOT NULL,
            action_type TINYINT NOT NULL,
            user VARCHAR(255) NOT NULL,
            data JSON NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $this->conn->query($sql);
    }

    /**
     * Retrieves the history records based on the provided parameters.
     *
     * @param int $limit The maximum number of records to retrieve. Defaults to 1000.
     * @param int $page The page number to retrieve. Defaults to 0.
     * @param string $sort The field to use for sorting the history records. Defaults to "timestamp".
     * @param bool $asc The sort order. Set to true for ascending order, false for descending order. Defaults to false.
     * @return array An array containing the retrieved history records.
     * @throws Exception If there are any errors in preparing the SQL statement, binding parameters, executing the statement,
     *                   getting the result, or closing the statement.
     */
    public function get_history(int $limit = 1000, int $page = 0, string $sort = "timestamp", bool $asc = false): array
    {
        $sortOrder = $asc ? "ASC" : "DESC";
        $offset = $page * $limit;
        try {
            $sql = "SELECT * FROM `history` ORDER BY $sort $sortOrder LIMIT $limit OFFSET $offset";
            $result = @$this->conn->query($sql);
        } catch (Exception $e) {
            throw new Exception("Unable to execute sql statement: " . $e->getMessage());
        }

        return array_map(function ($item) {
            $item["id"] = $this->hashids->encode($item["id"]);
            $item["data"] = json_decode($item["data"], true);
            return $item;
        }, $result->fetch_all(MYSQLI_ASSOC));
    }

    /**
     * Retrieves the location history based on the provided parameters.
     *
     * @param string $location_id The ID of the location whose history is to be retrieved.
     * @param int $limit The maximum number of records to retrieve. Defaults to 1000.
     * @param int $page The page number to retrieve. Defaults to 0.
     * @param string $sort The field to use for sorting the history records. Defaults to "timestamp".
     * @param bool $asc The sort order. Set to true for ascending order, false for descending order. Defaults to false.
     * @return array An array containing the retrieved history records.
     * @throws Exception If there are any errors in preparing the SQL statement, binding parameters, executing the statement,
     *                   getting the result, or closing the statement.
     */
    public function get_location_history(string $location_id, int $limit = 1000, int $page = 0, string $sort = "timestamp", bool $asc = false): array
    {
        $sortOrder = $asc ? "ASC" : "DESC";
        $offset = $page * $limit;

        try {
            $sql = "SELECT * FROM `history` WHERE location_id = ? ORDER BY $sort $sortOrder LIMIT $limit OFFSET $offset";
            $stmt = @$this->conn->prepare($sql);
        } catch (Exception $e) {
            throw new Exception("Unable to prepare sql statement: " . $e->getMessage());
        }

        if ($stmt === false) {
            throw new Exception("Unable to prepare sql statement: " . $this->conn->error);
        }

        try {
            @$stmt->bind_param("s", $location_id);
        } catch (Exception $e) {
            throw new Exception("Unable to bind parameters: " . $e->getMessage());
        }
        try {
            @$stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Unable to execute statement: " . $e->getMessage());
        }
        try {

            $result = @$stmt->get_result();
        } catch (Exception $e) {
            throw new Exception("Unable to get result: " . $e->getMessage());
        }
        try {
            $stmt->close();
        } catch (Exception $e) {
            throw new Exception("Unable to close statement: " . $e->getMessage());
        }
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Retrieves the history records for a specific location and record.
     *
     * @param string $location_id The ID of the location.
     * @param string $record_id The ID of the record.
     * @param int $limit The maximum number of history records to retrieve. Default is 1000.
     * @param int $page The page number of results to retrieve. Default is 0.
     * @param string $sort The field to sort the records by. Default is "timestamp".
     * @param bool $asc Specifies whether the sorting order is ascending. Default is false.
     * @return array An array of history records matching the given criteria. Each history record is represented by an associative array.
     * @throws Exception if there is an error preparing the SQL statement, binding parameters, executing the statement, or retrieving the result.
     */
    public function get_record_history(string $location_id, string $record_id, int $limit = 1000, int $page = 0, string $sort = "timestamp", bool $asc = false): array
    {
        $sortOrder = $asc ? "ASC" : "DESC";
        $offset = $page * $limit;
        try {
            $sql = "SELECT * FROM `history` WHERE location_id = ? AND record_id = ? ORDER BY $sort $sortOrder LIMIT $limit OFFSET $offset";
            $stmt = $this->conn->prepare($sql);
        } catch (Exception $e) {
            throw new Exception("Unable to prepare sql statement: " . $e->getMessage());
        }

        try {
            $stmt->bind_param("ss", $location_id, $record_id);
        } catch (Exception $e) {
            throw new Exception("Unable to bind parameters: " . $e->getMessage());
        }
        try {
            $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Unable to execute statement: " . $e->getMessage());
        }
        try {
            $result = $stmt->get_result();
        } catch (Exception $e) {
            throw new Exception("Unable to get result: " . $e->getMessage());
        }
        $stmt->close();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Adds a history record to the database
     *
     * @param string $location_id The ID of the location
     * @param string $record_id The ID of the record
     * @param ActionType $action_type The type of action being performed
     * @param string $user The user who performed the action
     * @param array $data The data associated with the history record
     * @return void
     * @throws Exception If the provided record ID is invalid
     * @throws Exception If there is an error preparing the SQL statement, encoding the data, binding parameters, or executing the statement
     */
    public function add_history(string $location_id, string $record_id, ActionType $action_type, string $user, array $data): void
    {
        $action_type = $action_type->value;
        try {
            $sql = "INSERT INTO `history` (location_id, record_id, action_type, user, data) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
        } catch (Exception $e) {
            throw new Exception("Unable to prepare sql statement: " . $e->getMessage());
        }
        try {
            $json = json_encode($data);
        } catch (Exception $e) {
            throw new Exception("Unable to encode data: " . $e->getMessage());
        }
        try {
            $stmt->bind_param("sssss", $location_id, $record_id, $action_type, $user, $json);
        } catch (Exception $e) {
            throw new Exception("Unable to bind parameters: " . $e->getMessage());
        }
        try {
            $stmt->execute();
        } catch (Exception $e) {
            throw new Exception("Unable to execute statement: " . $e->getMessage());
        }
        $stmt->close();
    }

}