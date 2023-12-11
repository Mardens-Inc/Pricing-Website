<?php
header('Access-Control-Allow-Origin: *');
header("Content-Type: application/json");
require_once($_SERVER["DOCUMENT_ROOT"] .  "/assets/php/db/locations.inc.php");
$loc = new Locations();

http_response_code(500);


if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['action'])) {

        switch ($_GET["action"]) {
            case "get-images":
                $result = $loc->get_images();
                http_response_code(200);
                die(json_encode($result));
            case "has-image":
                if (isset($_GET['id'])) {
                    $id = $_GET['id'];
                    $result = $loc->has_image($id);
                    http_response_code(200);
                    die(json_encode(["has_image" => $result]));
                } else {
                    http_response_code(401);
                    die(json_encode(array("error" => "Missing required fields")));
                }
            case "get-image":
                if (isset($_GET['id'])) {
                    $id = $_GET['id'];
                    $result = $loc->get_image($id);
                    if (isset($_GET["raw"]) && $result['success']) {
                        http_response_code(200);
                        header("location: " . $result["image"]);
                        die();
                    }
                    http_response_code(200);
                    die(json_encode($result));
                } else {
                    http_response_code(401);
                    die(json_encode(array("error" => "Missing required fields")));
                }
            case "single":
                if (isset($_GET['id'])) {
                    $id = $_GET['id'];
                    $result = $loc->byID($id);
                    http_response_code(200);
                    die(json_encode($result));
                } else {
                    http_response_code(401);
                    die(json_encode(array("error" => "Missing required fields")));
                }
        }
    } else {
        $max = isset($_GET['limit']) ? $_GET['limit'] : 0;
        $page = isset($_GET['page']) ? $_GET['page'] : 0;
        $sort = isset($_GET['sort']) ? $_GET['sort'] : "";
        $query = isset($_GET['query']) ? $_GET['query'] : "";
        $items = $loc->list($max, $page, $sort, isset($_GET['asc']), $query);
        http_response_code(200);
        die(json_encode($items));
    }
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    if (isset($_GET["action"]) && $_GET["action"] == "edit") {
        if (!isset($_POST['name']) || !isset($_POST['location']) || !isset($_POST['po']) || !isset($_GET['id'])) {
            http_response_code(400);
            die(json_encode(array("error" => "Missing required fields")));
        }
        $id = $_GET['id'];
        $name = $_POST['name'];
        $location = $_POST['location'];
        $po = $_POST['po'];
        $image = $_POST['image'] ?? "";
        $options = $_POST['options'] ?? "";
        http_response_code(200);
        die(json_encode($loc->editRecord($id, $name, $location, $po, $image, $options)));
    }

    if (!isset($_POST['name']) || !isset($_POST['location']) || !isset($_POST['po'])) {
        http_response_code(400);
        die(json_encode(array("error" => "Missing required fields")));
    }
    $name = $_POST['name'];
    $location = $_POST['location'];
    $po = $_POST['po'];
    $rows = explode(";", $_POST['rows']);
    $image = $_POST['image'] ?? "";
    $result = $loc->add($name, $location, $po, $image, $rows);
    http_response_code(200);
    die(json_encode($result));
} else if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
    http_response_code(200);
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $result = $loc->delete($id);
        http_response_code(200);
        die(json_encode($result));
    } else {
        http_response_code(401);
        die(json_encode(array("error" => "Missing required fields")));
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Invalid request method"]);
    exit();
}
