<?php
class FileMakerAuth
{
    /**
     * Get a FileMaker Data API token for a given database
     * @param string $username The username to use for authentication
     * @param string $password The password to use for authentication
     * @param string $database The database to get a token for
     * @return array An array containing the token or an error message
     */
    public static function GetDatabaseToken(string $username, string $password, string $database): array
    {
        $apiUrl = "https://fm.mardens.com/fmi/data/v2/databases/$database/sessions";
        // Encode the username and password for basic authentication
        $authString = $username . ':' . $password;
        $base64EncodedString = base64_encode($authString);
        // Set up HTTP headers
        $headers = [
            'http' => [
                'header' => "Authorization: Basic $base64EncodedString\r\n" .
                    "Content-Type: application/json\r\n",
                'method' => 'POST',
                'content' => '{}',
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
                return array('token' => json_decode($response)->response->token);
            }
        }catch(Exception $e){
            http_response_code(500);
            return array('error' => 'Error connecting to FileMaker Server: ' . $e->getMessage());
        }
    }
}
