<?php

use Slim\Factory\AppFactory;

header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");
require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/location.inc.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";

$app = AppFactory::create();
$app->setBasePath("/api/location/{id}");

$app->get("/", function ($request, $response, $args) {
    require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/locations.inc.php";
    $loc = new Locations();
    $id = $args['id'];
    $result = $loc->byID($id);
    $result["image"] = @$loc->get_image($id)["image"] ?? "";
    $headingsOnly = $request->getQueryParams()["headings"] ?? false;
    $sort = $request->getQueryParams()["sort"] ?? "id";
    $asc = $request->getQueryParams()["asc"] ?? false;


    if (!$headingsOnly) {
        $loc = new Location($id);
        $result["results"] = @$loc->list(10, 0, "id", false, "");
    }

    return $response->withHeader("Content-Type", "application/json")->withJson([$result]);
});

$app->get('/columns', function ($request, $response, $args) {
    $loc = new Location($args["id"]);
    $result = $loc->getColumns();
    return $response->withJson($result);
});
$app->post("/add/filemaker", function ($request, $response, $args) {
    $loc = new Location($args["id"]);
    $json = json_decode(file_get_contents("php://input"), true);
    if (!$json || json_last_error_msg() != "No error") {
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
    }

    if(!isset($json["username"]) || !isset($json["password"]) || !isset($json["layout"]) || !isset($json["database"]))
    {
        $missing = array_diff(["username", "password", "layout", "database"], array_keys($json));
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Missing required parameters", "missing" => $missing]);
    }

    $username = $json["username"];
    $password = $json["password"];
    $layout = $json["layout"];
    $database = $json["database"];
    $result = $loc->importFromFilemaker($username, $password, $database, $layout);
    return $response->withJson($result);
});

$app->get("/ws", function ($request, $response, $args) {
    // create a websocket
    $ws = new WebSocket("localhost", 8080);
});


$app->run();



//$loc = new Location();
//
//if (isset($_GET["id"])) {
//    $id = $_GET["id"];
//} else {
//    http_response_code(400);
//    die(json_encode(["success" => false, "error" => "Missing id parameter"]));
//}
//
//$max_count = 10;
//$page = 0;
//
//if (isset($_GET["max_count"])) $max_count = $_GET["max_count"];
//if (isset($_GET["page"])) $page = $_GET["page"];
//
//if ($_SERVER["REQUEST_METHOD"] == "GET") {
//
//    // If the action parameter is set...
//    if (isset($_GET["action"])) {
//        // ...check the value of action and act accordingly.
//        switch ($_GET["action"]) {
//            case "columns":
//                // Call the columns() method on the $loc object.
//                $result = $loc->getColumns($id);
//                http_response_code(200);
//                die(json_encode($result));
//        }
//    } else {
//
//        $query = "";
//        // If the query parameter is not set, return a 400 Bad Request error.
//        if (isset($_GET["query"])) {
//            $query = $_GET["query"];
//        }
//
//        // If the limit parameter is set, use that value. Otherwise, use 0.
//        $max = isset($_GET['limit']) ? $_GET['limit'] : 10;
//        // If the page parameter is set, use that value. Otherwise, use 0.
//        $page = isset($_GET['page']) ? $_GET['page'] : 0;
//        // If the sort parameter is set, use that value. Otherwise, use an empty string.
//        $sort = isset($_GET['sort']) ? $_GET['sort'] : "";
//
//        // Call the list() method on the $loc object, passing in the appropriate parameters.
//        $result = $loc->list($id, $max, $page, $sort, isset($_GET['asc']), $query);
//        http_response_code(200);
//        die(json_encode($result));
//    }
//} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
//
//    // Call the add() method of the location object
//    $json = json_decode(file_get_contents("php://input"), true);
//
//    if (!$json || json_last_error_msg() != "No error") {
//        http_response_code(400);
//        die(json_encode(["success" => false, "error" => "Invalid JSON"]));
//    }
//
//    if(isset($_GET["action"]))
//    {
//        switch($_GET["action"])
//        {
//            case "edit":
//                http_response_code(200);
//                die(json_encode($loc->edit($id, $json)));
//        }
//    }
//
//    http_response_code(200);
//    die(json_encode($loc->add($id, $json)));
//} else if ($_SERVER["REQUEST_METHOD"] == "DELETE") {
//    http_response_code(200);
//    if (isset($_GET["item"])) {
//        $item = $_GET["item"];
//        die(json_encode($loc->delete($id, $item)));
//    } else {
//        die(json_encode($loc->deleteAllRecords($id)));
//    }
//}  else {
//    http_response_code(405);
//    die(json_encode(["success" => false, "error" => "Invalid request method"]));
//}
