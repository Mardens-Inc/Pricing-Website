<?php

$url = "https://auth.mardens.com";
$file = $_SERVER['DOCUMENT_ROOT'] . "/assets/lib/mardens-auth-lib.js";
// Get last modified time of the url
// Ignore ssl errors
$last_modified = file_get_contents($url . "/?time", false, stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: text/plaintext'
    ], 'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false,
    ],
]));
$last_modified = intval($last_modified);

if (!file_exists($file) || $last_modified >= filemtime($file)) {
    // Download the file
    file_put_contents($file, file_get_contents($url . "/", false, stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => 'Content-Type: text/javascript'
        ], 'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ],
    ])));
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Metadata -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Database Directory</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/x-icon">

    <!-- CSS Styling -->
    <link rel="stylesheet" href="/assets/css/voice.min.css">
    <link rel="stylesheet" href="/assets/css/home.min.css">
    <link rel="stylesheet" href="/assets/css/tables.min.css">
    <link rel="stylesheet" href="/assets/css/popups.min.css">
    <link rel="stylesheet" href="/assets/css/inputs.min.css">
    <link rel="stylesheet" href="/assets/css/main.min.css">
    <link rel="stylesheet" href="/assets/css/scrollbar.min.css">
    <link rel="stylesheet" href="/assets/fonts/fonts.min.css">

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

    <!-- FontAwesome -->
    <script src="/assets/lib/fontawesome-free-6.5.1-web/js/all.min.js" defer></script>

    <!-- SheetJS for Excel Parsing -->
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>

    <!-- Setup JS Classes -->
    <script src="/assets/js/database.js"></script>
    <script src="/assets/js/authentication.js"></script>
    <script src="/assets/js/parsing.js"></script>

</head>

<body>

<nav>
    <button id="admin-login" class="secondary">Administrator</button>
    <button id="directory-button" class="only-on-list-view">Database Directory</button>
</nav>
<div id="content" class="col center horizontal fill">
    <div class="row">
        <img id="logo-image" src="/assets/images/logo.svg" alt="">
        <div id="page-header">Pricing Database Directory</div>
    </div>
    <hr>
    <div class="row">
        <div id="count-area" class="row fill center vertical">
            <span>Show </span>
            <select name="entries" id="entries">
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
            <span> entries</span>
        </div>
        <div id="search-area" class="row fill">
            <input type="search" name="search" id="search" placeholder="Type to filter results" title="search input">
            <button id="clear-search" title="Clear search">x</button>
        </div>
    </div>

    <div class="row">
        <table class="search-table"></table>
    </div>
    <span id="showing-message" class="fill"></span>
    <div class="pagination row center horizontal vertical fill"></div>
</div>

<?php require_once "assets/php/sections/popups.php"; ?>

<script type="module" src="/assets/js/authorization.js"></script>
<script src="/assets/js/directory.js"></script>
<script src="/assets/js/inputs.js"></script>
<script src="/assets/js/voice-search.js"></script>
</body>

</html>