<?php

/**
 * Database connection class
 */
class DB_Connect
{
    /**
     * Establish database connection
     * @return mysqli The database handler
     */
    public static function connect(): mysqli
    {
        global $DB_HOST, $DB_USER, $DB_PASSWORD, $DB_NAME;
        require_once 'config.inc.php';

        // Connecting to mysql database
        try{
            $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASSWORD);
            $conn->query("CREATE DATABASE IF NOT EXISTS `$DB_NAME`");
            $conn = new mysqli($DB_HOST, $DB_USER, $DB_PASSWORD, $DB_NAME);
        }catch(mysqli_sql_exception $e){
            header("Content-Type: application/json");
            die(json_encode(["error" => "Connection failed: " . mysqli_connect_error()]));
        }

        // return database handler
        return $conn;
    }
}
