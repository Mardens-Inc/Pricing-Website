<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");

use Slim\Factory\AppFactory;

require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
require_once($_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/history.inc.php");


$app = AppFactory::create();

$app->setBasePath("/api/history");
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);
$history = new History();
$app->get('/[{location}[/{record}]]', function ($request, $response, $args) use ($history) {
    $limit = $request->getQueryParams()['limit'] ?? 1000;
    $page = $request->getQueryParams()['page'] ?? 0;
    $sort = $request->getQueryParams()['sort'] ?? "timestamp";
    $asc = $request->getQueryParams()['asc'] ?? false;
    try {
        if (isset($args['location']) && isset($args['record']))
            $result = $history->get_record_history($args['location'], $args['record'], $limit, $page, $sort, $asc);
        else if (isset($args['location']))
            $result = $history->get_location_history($args['location'], $limit, $page, $sort, $asc);
        else
            $result = $history->get_history($limit, $page, $sort, $asc);
        return $response->withJson($result)->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $response->withJson(["error" => $e->getMessage()])->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->post("/", function ($request, $response) use ($history) {
    $data = $request->getParsedBody();
    try {
        $history->add_history($data['location_id'], $data['record_id'], ActionType::from($data['action_type']), $data["user"], $data['data']);
        return $response->withJson(["success" => true])->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $response->withJson(["success" => false, "error" => $e->getMessage()])->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->run();