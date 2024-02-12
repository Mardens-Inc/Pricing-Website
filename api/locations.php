<?php

use Slim\App;
use Slim\Factory\AppFactory;

require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
require_once($_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/locations.inc.php");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");


$app = AppFactory::create();
$app->setBasePath("/api/locations");
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

$app->get("/", function ($request, $response, $args) {
    $params = $request->getQueryParams();
    $loc = new Locations();
    $max = $params['limit'] ?? 10;
    $page = $params['page'] ?? 0;
    $sort = $params['sort'] ?? "id";
    $items = $loc->list($max, $page, $sort, isset($_GET['asc']), "");
    return $response->withHeader("Content-Type", "application/json")->withJson($items);
});
$app->get("/all", function ($request, $response, $args) {
    $loc = new Locations();
    $items = $loc->listAll();
    return $response->withHeader("Content-Type", "application/json")->withJson($items);
});

$app->get("/images", function ($request, $response, $args) {
    $loc = new Locations();
    $result = $loc->get_images();
    return $response->withHeader("Content-Type", "application/json")->withJson($result);
});

$app->get("/og", function ($request, $response, $args) {
    $loc = new Locations();
    $insert = isset($request->getQueryParams()['insert']);
    $result = $loc->from_og($insert);
    return $response->withHeader("Content-Type", "application/json")->withJson($result);
});

$app->get("/{id}", function ($request, $response, $args) {
    $loc = new Locations();
    $id = $args['id'];
    $result = $loc->byID($id);
    $result["image"] = @$loc->get_image($id)["image"] ?? "";
    return $response->withHeader("Content-Type", "application/json")->withJson($result);
});

$app->get("/{id}/image", function ($request, $response, $args) {
    $loc = new Locations();
    $id = $args['id'];
    $result = $loc->get_image($id);
    if ($result['success']) {
        $url = $result['image'];
        return $response->withStatus(302)->withHeader("Location", $url);
    } else {
        return $response->withStatus(404)->withHeader("Content-Type", "application/json")->withJson($result);
    }
});


$app->run();

//exit();
//
//
//if ($_SERVER['REQUEST_METHOD'] == 'GET') {
//    if (isset($_GET['action'])) {
//
//        switch ($_GET["action"]) {
//            case "get-images":
//                $result = $loc->get_images();
//                http_response_code(200);
//                die(json_encode($result));
//            case "has-image":
//                if (isset($_GET['id'])) {
//                    $id = $_GET['id'];
//                    $result = $loc->has_image($id);
//                    http_response_code(200);
//                    die(json_encode(["has_image" => $result]));
//                } else {
//                    http_response_code(401);
//                    die(json_encode(array("error" => "Missing required fields")));
//                }
//            case "get-image":
//                if (isset($_GET['id'])) {
//                    $id = $_GET['id'];
//                    $result = $loc->get_image($id);
//                    if (isset($_GET["raw"]) && $result['success']) {
//                        http_response_code(200);
//                        header("location: " . $result["image"]);
//                        die();
//                    }
//                    http_response_code(200);
//                    die(json_encode($result));
//                } else {
//                    http_response_code(401);
//                    die(json_encode(array("error" => "Missing required fields")));
//                }
//            case "single":
//                if (isset($_GET['id'])) {
//                    $id = $_GET['id'];
//                    $result = $loc->byID($id);
//                    http_response_code(200);
//                    die(json_encode($result));
//                } else {
//                    http_response_code(401);
//                    die(json_encode(array("error" => "Missing required fields")));
//                }
//            case "from-og":
//                break;
//        }
//    } else {
//        $max = isset($_GET['limit']) ? $_GET['limit'] : 0;
//        $page = isset($_GET['page']) ? $_GET['page'] : 0;
//        $sort = isset($_GET['sort']) ? $_GET['sort'] : "";
//        $query = isset($_GET['query']) ? $_GET['query'] : "";
//        $items = $loc->list($max, $page, $sort, isset($_GET['asc']), $query);
//        http_response_code(200);
//        die(json_encode($items));
//    }
//} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
//    if (isset($_GET["action"]) && $_GET["action"] == "edit") {
//        if (!isset($_POST['name']) || !isset($_POST['location']) || !isset($_POST['po']) || !isset($_GET['id'])) {
//            http_response_code(400);
//            die(json_encode(array("error" => "Missing required fields")));
//        }
//        $id = $_GET['id'];
//        $name = $_POST['name'];
//        $location = $_POST['location'];
//        $po = $_POST['po'];
//        $image = $_POST['image'] ?? "";
//        $options = $_POST['options'] ?? "";
//        http_response_code(200);
//        die(json_encode($loc->editRecord($id, $name, $location, $po, $image, $options)));
//    }
//
//    if (!isset($_POST['name']) || !isset($_POST['location']) || !isset($_POST['po'])) {
//        http_response_code(400);
//        die(json_encode(array("error" => "Missing required fields")));
//    }
//    $name = $_POST['name'];
//    $location = $_POST['location'];
//    $po = $_POST['po'];
//    $rows = explode(";", $_POST['rows']);
//    $image = $_POST['image'] ?? "";
//    $result = $loc->add($name, $location, $po, $image, $rows);
//    http_response_code(200);
//    die(json_encode($result));
//} else if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
//    http_response_code(200);
//    if (isset($_GET['id'])) {
//        $id = $_GET['id'];
//        $result = $loc->delete($id);
//        http_response_code(200);
//        die(json_encode($result));
//    } else {
//        http_response_code(401);
//        die(json_encode(array("error" => "Missing required fields")));
//    }
//} else {
//    http_response_code(405);
//    echo json_encode(["success" => false, "error" => "Invalid request method"]);
//    exit();
//}
