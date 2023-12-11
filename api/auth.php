<?php

require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/db/auth.inc.php";
$auth = new Authentication();
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (!isset($_COOKIE["auth-token"])) {
        http_response_code(401);
        die(json_encode(array("error" => "Unauthorized access.")));
    }

    if (isset($_GET["id"])) {
        $id = $_GET["id"];
        $result = $auth->get($id);
        if ($result) {
            http_response_code(200);
            die(json_encode($result));
        } else {
            http_response_code(400);
            die(json_encode(array("error" => "User not found.")));
        }
    }
    return $auth->list();
} else if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_GET["action"])) {
        switch ($_GET["action"]) {
                
        }
    }else{
        if (isset($_POST["username"]) && isset($_POST["password"])) {
            $username = $_POST["username"];
            $password = $_POST["password"];
            http_response_code(200);
            die(json_encode($auth->login($username, $password)));
        } else {
            if (isset($_COOKIE['auth-token'])) {
                http_response_code(200);
                die(json_encode($auth->loginCookies()));
            }
            http_response_code(400);
            die(json_encode(array("error" => "Missing username or password.")));
        }
    }
}
