<?php
require_once $_SERVER['DOCUMENT_ROOT'] . "/vendor/autoload.php";
$file = $_SERVER['DOCUMENT_ROOT'] . "/config.json";
if (!file_exists($file)) {
    die(json_encode(["error" => "Config file not found!"]));
}
$json = json_decode(file_get_contents($file), true);
try {
    $hash = @$json["hash"];
} catch (Exception $e) {
    $hash = null;
}

// Database configuration
$DB_HOST = $json["host"];
$DB_USER = $json["user"];
$DB_PASSWORD = $json["password"];
$DB_NAME = $json["database"];

if (!isset($_ENV["HASH_SALT"]) || $_ENV["HASH_SALT"] == "") {
    // Hash salt
    if ($hash == null || $hash == "") {
        $guid = getGUID();

        $json["hash"] = $guid;
        $file = $_SERVER['DOCUMENT_ROOT'] . "/config.json";
        file_put_contents($file, json_encode($json, JSON_PRETTY_PRINT));
        $_ENV["HASH_SALT"] = $guid;
    } else {
        $_ENV["HASH_SALT"] = $hash;
    }
}


function getGUID()
{
    if (function_exists('com_create_guid')) {
        return com_create_guid();
    } else {
        mt_srand((float)microtime() * 10000); //optional for php 4.2.0 and up.
        $charid = strtoupper(md5(uniqid(rand(), true)));
        $uuid =
            substr($charid, 0, 8)
            . substr($charid, 8, 4)
            . substr($charid, 12, 4)
            . substr($charid, 16, 4)
            . substr($charid, 20, 12);
        return $uuid;
    }
}
