<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";

use Hashids\Hashids;

/**
 * Handles the locations database
 */
class Locations
{
    private mysqli $connection;
    private Hashids $hashids;

    public function __construct()
    {
        require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/connections.inc.php";
        $this->connection = DB_Connect::connect(); // Connect to locations database
        $this->hashids = new Hashids($_ENV["HASH_SALT"], 10);

        // Create the locations table if it doesn't exist
        $sql = "CREATE TABLE IF NOT EXISTS `locations` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `location` varchar(255) NOT NULL,
            `po` varchar(255) NOT NULL,
            `image` varchar(255) NOT NULL,
            `options` varchar(4096) NOT NULL DEFAULT '{}',
            `post_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $this->connection->query($sql);
    }

    /**
     * Get a list of locations
     * @param int $max_count The maximum number of locations to return. 0 or blank for all locations
     * @param int $page The offset to start from, ie the page number
     * @param string $sort The column to sort by
     * @param bool $ascending Whether to sort ascending or descending
     * @param string $query The search query to filter by
     * @return array An array of locations
     */
    public function list(int $max_count = 0, int $page = 0, string $sort = "", bool $ascending = true, string $query = ""): array
    {
        // If max_count is 0, return all locations
        $sql = "SELECT * FROM locations";
        if (!empty($query)) {
            $sql .= " WHERE name LIKE '%$query%' OR location LIKE '%$query%' OR po LIKE '%$query%'";
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
            return array(); // If the query failed, return an empty array
        }

        // Make an array of locations from the query results
        $locations = array();
        while ($row = $result->fetch_assoc()) {
            $row["id"] = $this->hashids->encode($row["id"]);
            $row["image"] = @$this->get_image($row["id"])["image"] ?? "";
            $locations[] = $row;
        }

        $count = 0;

        $sql = "SELECT COUNT(*) FROM locations";
        if (!empty($query)) {
            $sql .= " WHERE name LIKE '%$query%' OR location LIKE '%$query%' OR po LIKE '%$query%'";
        }
        $result = $this->connection->query($sql);
        if ($result) {
            $count = $result->fetch_assoc()["COUNT(*)"];
        }

        return ["total_results" => $count, "max_count" => $max_count, "page" => $page, "success" => true, "items" => $locations];
    }

    /**
     * Get a list of all locations
     *
     * @return array An array of all locations, where each location is represented as an associative array
     */
    public function listAll(): array
    {
        $sql = "SELECT * FROM locations ORDER BY id DESC";
        $result = $this->connection->query($sql);
        if (!$result) {
            return []; // If the query failed, return an empty array
        }
        $locations = [];
        while ($row = $result->fetch_assoc()) {
            $row["id"] = $this->hashids->encode($row["id"]);
            $row["image"] = @$this->get_image($row["id"])["image"] ?? "";
            $locations[] = $row;
        }
        return $locations;
    }

    function byID(string $id): array
    {
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid id supplied"]; // If the query failed, return an empty array
        }
        $id = $id[0];
        $sql = "SELECT * FROM locations WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return array(); // If the query failed, return an empty array
        }
        $row = $result->fetch_assoc();
        $row["options"] = json_decode($row["options"], true);
        $row["id"] = $this->hashids->encode($row["id"]);
        $row["image"] = strtolower($row["image"]);
        require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/location.inc.php";
        $loc = new Location($row["id"]);
        $cols = $loc->getColumns();
        $row["columns"] = $cols["columns"];

        return $row;
    }

    /**
     * Add a location to the database
     * @param string $name The name of the location, eg "Walmart"
     * @param string $location The location name/address of the location, eg "123 Main St, City, State"
     * @param string $po The PO of the location
     * @param string $image The icon/logo of the location
     * @param array $rows
     * @return array An array containing the ID of the newly inserted location and whether the operation was successful
     */
    public function add(string $name, string $location, string $po, string $image, array $rows): array
    {
        // Prepared Insert query, with proper sanitization.
        $stmt = $this->connection->prepare("INSERT INTO locations (name, location, po, image) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $location, $po, $image);

        if (!$stmt->execute()) {
            return ["success" => false, "error" => "Failed to insert into table!"]; // If the query failed
        }

        $id = $this->connection->insert_id; // Get the ID of the newly inserted location
        $id = $this->hashids->encode($id); // Encode the ID

        $tableItems = "";

        foreach ($rows as $row) {
            $tableItems .= ", `$row` varchar(255) DEFAULT NULL";
        }

        $sql = "CREATE TABLE `$id` (`id` int(11) NOT NULL AUTO_INCREMENT$tableItems,`date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        // die($sql);
        $result = $this->connection->query($sql);

        if (!$result) {
            return ["success" => false, "error" => "Failed to create table!"]; // If the query failed
        }

        return ["id" => $id, "success" => true];
    }

    /**
     * Delete a location from the database
     * @param string $id The HASH ID of the location to delete
     * @return array An array containing whether the operation was successful
     */
    public function delete(string $id): array
    {
        $sql = "DROP TABLE `$id`";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Unable to drop table: $id"];
        }

        $id = $this->hashids->decode($id); // Decode the ID
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid ID"];
        }


        $id = $id[0];
        $sql = "DELETE FROM locations WHERE id = $id LIMIT 1";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false];
        }
        return ["success" => true];
    }

    /**
     * Check if a location has an image
     * @param string $id The Hash ID of the location to check
     * @return array Whether the location has an image
     */
    public function has_image(string $id): array
    {
        $target_dir = $_SERVER["DOCUMENT_ROOT"] . "/assets/images/locations/";
        $target_file = $target_dir . $id . '.png';
        return ["exists" => file_exists($target_file)];
    }

    public function get_images(): array
    {
        $target_dir = $_SERVER["DOCUMENT_ROOT"] . "/assets/images/locations/";
        $images = array();
        foreach (glob($target_dir . "*.png") as $filename) {
            $filename = str_replace($target_dir, "", $filename);
            $name = str_replace(".png", "", $filename);
            $file = $_SERVER["DOCUMENT_ROOT"] . "/assets/images/locations/" . $filename;
            $images[] = ["name" => $name, "url" => (isset($_SERVER["HTTPS"]) ? "https://" : "http://") . $_SERVER["HTTP_HOST"] . "/assets/images/locations/" . $filename . "?v=" . filemtime($file), "file" => $filename];
        }
        return $images;
    }

    /**
     * Get the image of a location
     * @param string $id The Hash ID of the location to get the image of
     * @return array An array containing whether the operation was successful and the image URL
     */
    public function get_image(string $id): array
    {
        $item = @$this->byID($id);
        if (empty($item) || empty($item["image"])) {
            return ["success" => false, "image" => ""];
        } else {
            $file = "/assets/images/locations/" . $item["image"];
            $url = (isset($_SERVER["HTTPS"]) ? "https://" : "http://") . $_SERVER["HTTP_HOST"] . $file . "?v=" . filemtime($_SERVER["DOCUMENT_ROOT"] . $file);
            return ["success" => true, "image" => $url];
        }
    }


    /**
     * Edit a location in the database
     * @param string $id The HASH ID of the location to edit
     * @param string $name The name of the location, eg "Walmart"
     * @param string $location The location name/address of the location, eg "123 Main St, City, State"
     * @param string $po The PO of the location
     * @param string $image The icon/logo of the location
     * @param string $options The options of the location
     * @return array An array containing whether the operation was successful
     */
    public function editRecord(string $id, string $name, string $location, string $po, string $image, string $options): array
    {
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return array(); // If the query failed, return an empty array
        }
        $id = $id[0];
        $sql = "UPDATE locations SET name = '$name', location = '$location', po = '$po', image = '$image', options = '$options' WHERE id = $id";
        // echo $sql;
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false];
        }
        return ["success" => true];
    }

    /**
     * Extract location data from the supplied OpenGraph JSON and return as an array
     *
     * @param bool $insert [optional] Whether to insert the data into the database. Default is false.
     * @return array An array containing the extracted location data
     */
    public function from_og(bool $insert = false): array
    {
        $json = file_get_contents("https://fm.mardens.com/fmDataFiles/db_list.txt");
        try {
            $json = json_decode($json, true);
        } catch (Exception $e) {
            // Failed to parse the json.
            return ["success" => false, "error" => $e->getMessage()];
        }

        $locations = [];
        $json = $json["data"];
        foreach ($json as $item) {
            $location = [];
            $location["name"] = $item["name"];
            $location["location"] = $item["loc"];
            $location["po"] = $item["poNum"];
            $location["options"] = [];
            $location["image"] = $item["icon"];
            $location["posted_date"] = $item["date"];
            $locations[] = $location;
        }
        if (!$insert) return ["success" => true, "locations" => $locations];
        $insertedLocations = 0;
        $failedLocations = 0;
        $insertedLocationItems = 0;
        $failedLocationItems = 0;
        foreach ($locations as $location) {
            $result = $this->add($location["name"], $location["location"], $location["po"], $location["image"], []);
            if ($result["success"]) {
                $insertedLocations++;
            } else {
                $failedLocations++;
            }
        }
        $stats["locations"]["inserted"] = $insertedLocations;
        $stats["locations"]["failed"] = $failedLocations;
        $stats["items"]["inserted"] = $insertedLocationItems;
        $stats["items"]["failed"] = $failedLocationItems;
        return ["success" => true, "stats" => $stats, "locations" => $locations];
    }
}