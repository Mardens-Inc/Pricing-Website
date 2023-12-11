<?php

class FileMaker{
    public static function GetDatabaseRows($database, $layout, $token){
        $apiUrl = "https://fm.mardens.com/fmi/data/v2/databases/$database/layouts/$layout/records";
        // Set up HTTP headers
        $headers = [
            'http' => [
                'header' => "Authorization: Bearer $token\r\n" .
                    "Content-Type: application/json\r\n",
                'method' => 'GET',
            ],
        ];
        try{
            // Create a stream context
            $context = stream_context_create($headers);
            ob_start(); // Starts capturing the output buffer
            // Make the HTTP request using file_get_contents
            $response = file_get_contents($apiUrl, false, $context);
            ob_end_clean(); // Clear the output buffer
            // Check for errors
            if ($response === FALSE) {
                http_response_code(401);
                return array('error' => 'Error connecting to FileMaker Server');
            } else {
                return json_decode($response)->response->data;
            }
        }catch(Exception $e){
            http_response_code(500);
            return array('error' => 'Error connecting to FileMaker Server: ' . $e->getMessage());
        }
    }
}