<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");


use Slim\Factory\AppFactory;

require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/location.inc.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";

$app = AppFactory::create();
$app->setBasePath("/api/location/{id}");

$app->get("/", function ($request, $response, $args) {
    require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/locations.inc.php";
    $loc = new Locations();
    $id = $args['id'];
    $result = $loc->byID($id);
    if (isset($result["error"])) {
        return $response->withStatus(404)->withJson($result);
    }
    $result["image"] = @$loc->get_image($id)["image"] ?? "";
    $headingsOnly = $request->getQueryParams()["headings"] ?? false;
    $sort = $request->getQueryParams()["sort"] ?? "id";
    $asc = $request->getQueryParams()["asc"] ?? false;


    if (!$headingsOnly) {
        $loc = new Location($id);
        $result["results"] = @$loc->list(10, 0, $sort, $asc, "");
    }

    return $response->withHeader("Content-Type", "application/json")->withJson($result);
});

$app->get("/export", function ($request, $response, $args) {
    $loc = new Location($args["id"]);

    try {
        $result = $loc->export();
    } catch (Exception $e) {
        return $response->withStatus(500)->withJson(["success" => false, "error" => $e->getMessage()]);
    }

    $response->write($result);
    return $response->withHeader("Content-Type", "text/csv")->withHeader("Content-Disposition", "attachment; filename=export.csv");
});

$app->get("/{record}", function ($request, $response, $args) {
    try {
        $loc = new Location($args["id"]);
        $record = $args["record"];
        $result = $loc->get($record);
        if ($result == []) {
            return $response->withStatus(404)->withJson(["success" => false, "error" => "Record not found"]);
        }
        return $response->withJson($result);
    } catch (Exception $e) {
        return $response->withStatus(500)->withJson(["success" => false, "error" => $e->getMessage()]);
    }
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

    if (!isset($json["username"]) || !isset($json["password"]) || !isset($json["layout"]) || !isset($json["database"])) {
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

$app->patch("/", function ($request, $response, $args) {
    require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/locations.inc.php";
    $json = json_decode(file_get_contents("php://input"), true);
    if (json_last_error_msg() != "No error") {
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
    }
    $loc = new Locations();
    $id = $args["id"];
    $name = $json["name"];
    $location = $json["location"];
    $po = $json["po"];
    $image = $json["image"];
    $options = json_encode($json["options"]);
    $result = $loc->editRecord($id, $name, $location, $po, $image, $options);
    if ($result == []) {
        return $response->withStatus(404)->withJson(["success" => false, "error" => "Record not found"]);
    }
    if (!$result["success"]) {
        return $response->withStatus(400)->withJson($result);
    }
    return $response->withJson($result);
});
$app->patch("/columns/{column}", function ($request, $response, $args) {
    $json = json_decode(file_get_contents("php://input"), true);
    if (!$json || json_last_error_msg() != "No error") {
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
    }
    try {
        $loc = new Location($args["id"]);
        $result = $loc->renameColumn($args["column"], $json["name"]);
        if (!$result["success"]) {
            return $response->withStatus(400)->withJson($result);
        }
        return $response->withJson($result);
    } catch (Exception $e) {
        return $response->withStatus(500)->withJson(["success" => false, "error" => $e->getMessage()]);
    }
});
$app->patch("/columns", function ($request, $response, $args) {
    $json = json_decode(file_get_contents("php://input"), true);
    if (!$json || json_last_error_msg() != "No error") {
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
    }
    $loc = new Location($args["id"]);
    $result = $loc->setColumns($json);
    return $response->withJson($result);
});


$app->post("/search", function ($request, $response, $args) {
    $json = json_decode(file_get_contents("php://input"), true);
    if (!$json || json_last_error_msg() != "No error") {
        return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
    }
    $loc = new Location($args["id"]);
    $query = $json["query"];
    $columns = $json["columns"] ?? [];
    $sort = $json["sort"] ?? "id";
    $asc = $json["asc"] ?? false;
    $limit = $json["limit"] ?? 10;
    $page = $json["page"] ?? 0;
    $result = $loc->list($limit, $page, $sort, $asc, $query, $columns);
    return $response->withJson($result);
});

$app->post("/[{record_id}/]", function ($request, $response, $args) {
    $loc = new Location($args["id"]);
    $body = $request->getBody();
    $user = $request->getHeader("X-User") ?? "system";
    if ($request->getHeader("Content-Type")[0] == "text/csv") {
        try {
            $result = $loc->importCSV($body);
            if (!$result["success"]) return $response->withStatus(400)->withJson($result);
            return $response->withJson($result);
        } catch (Exception $e) {
            return $response->withStatus(500)->withJson(["success" => false, "error" => $e->getMessage()]);
        }
    } else {
        $json = json_decode($body, true);
        if (!$json || json_last_error_msg() != "No error") {
            return $response->withStatus(400)->withJson(["success" => false, "error" => "Invalid JSON"]);
        }
        try {
            if (isset($args["record_id"])) {
                $result = $loc->edit($args["record_id"], $json, $user);
            } else {
                $result = $loc->add($json, $user);

            }
            if (!$result["success"]) {
                return $response->withStatus(400)->withJson($result);
            } else {

                if ($result["success"] == 0 && $result["failure"] > 0) {
                    return $response->withStatus(400)->withJson($result);
                }
                return $response->withJson($result);
            }
        } catch (Exception $e) {
            return $response->withStatus(500)->withJson(["success" => false, "error" => $e->getMessage()]);
        }
    }
});

$app->post("/column/{column}", function ($request, $response, $args) {
    $loc = new Location($args["id"]);
    $result = $loc->addColumn($args["column"]);
    return $response->withJson($result);
});

$app->delete("/{record}/", function ($request, $response, $args) {
    $loc = new Location($args["id"]);
    $record = $args["record"];
    $user = $request->getHeader("X-User") ?? "system";
    $result = $loc->delete($record, $user);
    if ($result == []) {
        return $response->withStatus(404)->withJson(["success" => false, "error" => "Record not found"]);
    }
    return $response->withJson($result);
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
