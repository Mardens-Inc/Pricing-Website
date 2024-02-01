<?php

/**
 * Fetches libraries from the Marden's website and saves it to the server.
 * This is done to fix the issue of the libraries being blocked by CORS.
 * This script will be called everytime the page is loaded.
 * Is that a good Idea? Probably not. But it works.
 */

$libs = [
    "mardens-auth-lib.js" => "https://lib.mardens.com/auth/",
    "filemaker.js" => "https://lib.mardens.com/fmutil/",
];

foreach ($libs as $file => $url) {
    $file = $_SERVER['DOCUMENT_ROOT'] . "/assets/lib/$file";

    // Get last modified time of the url
    // Ignore SSL errors
    $lastModifiedUrl = constructUrl($url, "js/time");
    $last_modified = retrieveUrlContents($lastModifiedUrl, "text/plaintext");
    $last_modified = intval($last_modified);

    if (!file_exists($file) || $last_modified >= filemtime($file)) {
        // Download the file
        $fileUrl = constructUrl($url);
        file_put_contents($file, retrieveUrlContents($fileUrl, "text/javascript"));
    }
}

/**
 * Retrieves the contents of a URL using the given URL and header content type.
 *
 * @param string $url The URL to retrieve the contents from.
 * @param string $headerContentType The header content type to be set in the request.
 *
 * @return bool|string The retrieved contents of the URL as a string, or false if unsuccessful.
 */
function retrieveUrlContents(string $url, string $headerContentType): bool|string
{
    return file_get_contents($url, false, stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Content-Type: $headerContentType"
        ], 'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ],
    ]));
}

/**
 * Constructs a URL using the given base URL and endpoint.
 *
 * @param string $baseUrl The base URL of the website.
 * @param string|null $endpoint The optional endpoint to append to the base URL. Default is null.
 *
 * @return string The constructed URL string.
 */
function constructUrl(string $baseUrl, string $endpoint = null): string
{
    return $endpoint ? $baseUrl . "{$endpoint}" : $baseUrl;
}