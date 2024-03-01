<?php
require_once $_SERVER['DOCUMENT_ROOT'] . '/assets/php/filemaker/fm-auth.inc.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/assets/php/filemaker/fm.inc.php';

header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
    http_response_code(405);
    die(json_encode(array('error' => 'Invalid request method')));
}

if (!isset($_GET['db'])) {
    http_response_code(400);
    die(json_encode(array('error' => 'No database specified')));
}
if (!isset($_POST['username'])) {
    http_response_code(401);
    die(json_encode(array('error' => 'No username specified')));
}
if (!isset($_POST['password'])) {
    http_response_code(401);
    die(json_encode(array('error' => 'No password specified')));
}

http_response_code(200);
$db = $_GET['db'];
$username = $_POST['username'];
$password = $_POST['password'];
$response = FileMakerAuth::GetDatabaseToken($username, $password, $db);
if (!$response) {
    http_response_code(500);
    die(json_encode(array('error' => 'Error connecting to FileMaker Server')));
}
$token = $response['token'];

FileMaker::GetDatabaseRows($db, 'Web', $token);