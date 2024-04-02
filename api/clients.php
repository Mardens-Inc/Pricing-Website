<?php


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");

use Slim\Factory\AppFactory;

require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
require_once($_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/Client.php");

$app = AppFactory::create();

$app->setBasePath("/api/clients");
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

$client = new Client();

$app->get('/versions', function ($request, $response) use ($client) {
    try {
        $result = $client->get_versions();
        return $response->withJson($result)->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $response->withJson(["error" => $e->getMessage()])->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});
$app->get('/versions/latest', function ($request, $response) use ($client) {
    try {
        $result = $client->get_versions();
        $result = end($result);
        return $response->withJson($result)->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $response->withJson(["error" => $e->getMessage()])->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->get("/updater", function ($request, $response) {
    $filename = "updater.exe";
    $path = $_SERVER['DOCUMENT_ROOT'] . "/downloads/updater.exe";
    return $response->withFile($path, "application/octet-stream")->withHeader('Content-Disposition', 'attachment; filename=' . $filename);
});
$app->get("/installer", function ($request, $response) {
    $path = $_SERVER['DOCUMENT_ROOT'] . "/downloads/pricing-app-installer.exe";
    return $response->withFile($path, "application/octet-stream")->withHeader('Content-Disposition', 'attachment; filename=pricing-app-installer.exe');
});

$app->get("/{version}", function ($request, $response, $args) use ($client) {
    $version = $args['version'];
    if ($version == "latest") {
        $versions = $client->get_versions();
        $version = end($versions);
    }
    return $response->withFile($_SERVER['DOCUMENT_ROOT'] . "/downloads/clients/$version/pricing-app.exe", "application/octet-stream")->withHeader('Content-Disposition', 'attachment; filename=pricing-app.exe');
});


$app->post("/upload", function ($request, $response) use ($client) {
    $data = $request->getParsedBody();
    try {
        $client->upload_version($_FILES["file"], $_POST['version']);
        return $response->withJson(["success" => true])->withHeader('Content-Type', 'application/json')->withStatus(200);
    } catch (Exception $e) {
        return $response->withJson(["success" => false, "error" => $e->getMessage()])->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


$app->run();