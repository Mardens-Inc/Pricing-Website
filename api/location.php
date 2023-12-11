<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");
require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/location.inc.php";
$loc = new Location();

if (isset($_GET["id"])) {
    $id = $_GET["id"];
} else {
    http_response_code(400);
    die(json_encode(["success" => false, "error" => "Missing id parameter"]));
}

$max_count = 10;
$page = 0;

if (isset($_GET["max_count"])) $max_count = $_GET["max_count"];
if (isset($_GET["page"])) $page = $_GET["page"];

if ($_SERVER["REQUEST_METHOD"] == "GET") {

    // If the action parameter is set...
    if (isset($_GET["action"])) {
        // ...check the value of action and act accordingly.
        switch ($_GET["action"]) {
            case "columns":
                // Call the columns() method on the $loc object.
                $result = $loc->getColumns($id);
                http_response_code(200);
                die(json_encode($result));
        }
    } else {

        $query = "";
        // If the query parameter is not set, return a 400 Bad Request error.
        if (isset($_GET["query"])) {
            $query = $_GET["query"];
        }

        // If the limit parameter is set, use that value. Otherwise, use 0.
        $max = isset($_GET['limit']) ? $_GET['limit'] : 10;
        // If the page parameter is set, use that value. Otherwise, use 0.
        $page = isset($_GET['page']) ? $_GET['page'] : 0;
        // If the sort parameter is set, use that value. Otherwise, use an empty string.
        $sort = isset($_GET['sort']) ? $_GET['sort'] : "";

        // Call the list() method on the $loc object, passing in the appropriate parameters.
        $result = $loc->list($id, $max, $page, $sort, isset($_GET['asc']), $query);
        http_response_code(200);
        die(json_encode($result));
    }
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Call the add() method of the location object
    $json = json_decode(file_get_contents("php://input"), true);

    if (!$json || json_last_error_msg() != "No error") {
        http_response_code(400);
        die(json_encode(["success" => false, "error" => "Invalid JSON"]));
    }
    die(json_encode($loc->add($id, $json)));
} else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    http_response_code(200);
    if (isset($_GET["item"])) {
        $item = $_GET["item"];
        die(json_encode($loc->delete($id, $item)));
    } else {
        die(json_encode($loc->deleteAllRecords($id)));
    }
}  else {
    http_response_code(405);
    die(json_encode(["success" => false, "error" => "Invalid request method"]));
}
