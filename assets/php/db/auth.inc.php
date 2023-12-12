<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";
require_once $_SERVER["DOCUMENT_ROOT"] . "/assets/php/data/user-permissions.inc.php";

use Hashids\Hashids;




class Authentication
{
    private $hashids;
    private $connection;
    public function __construct()
    {
        // Connect to the database
        require_once $_SERVER["DOCUMENT_ROOT"] .  "/assets/php/connections.inc.php";
        $this->connection = DB_Connect::connect();

        // Create a Hashids object to encode and decode IDs
        $this->hashids = new Hashids($_ENV["HASH_SALT"], 24);

        
        // Create the users table if it doesn't exist
        $sql = "CREATE TABLE IF NOT EXISTS `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `username` varchar(255) NOT NULL,
            `password` varchar(255) NOT NULL,
            `permissions` varchar(255) NOT NULL,
            PRIMARY KEY (`id`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
        $this->connection->query($sql);
        
        // Create the admin account if it doesn't exist
        $this->createAdminAccount();
    }

    /**
     * Add a user to the database
     * @param string $username The username of the user
     * @param string $password The password of the user
     * @param array $permissions The permissions of the user
     * @return array An array containing the ID of the newly inserted user and whether the operation was successful
     */
    public function add(string $username, string $password, array $permissions): array
    {
        // Get the token from the cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token)) {
            return ["success" => false, "error" => "No token found"];
        }
        $id = $this->validateToken($token);
        if (!$this->hasPermission($id, UserPermission::CreateUsers)) {
            return ["success" => false, "error" => "You do not have permission to add users"];
        }

        // Create a comma separated list of permissions
        $permissions = implode(";", $permissions);
        // Hash the password
        $password = crypt($password, $_ENV["HASH_SALT"]);

        // Create the SQL query
        $sql = "INSERT INTO `users` (username, password, permissions) VALUES ('$username', '$password', '$permissions')";
        // Send the query to the database
        $result = $this->connection->query($sql);
        // Check if the query was successful
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        // Check if the user was added
        if ($result->num_rows === 0) {
            return ["success" => false, "error" => "Failed to add user"];
        }
        // Get the ID of the user
        $id = $this->connection->insert_id;
        // Encode the ID
        $id = $this->hashids->encode($id);
        // Create a token for the user
        return ["success" => true, "id" => $id, "token" => $this->createToken($username, $password)];
    }


    /**
     * Remove a user from the database
     * @param string $id The ID of the user to remove
     * @return array An array containing whether the operation was successful
     */
    public function remove(string $id): array
    {
        // Get the token from the cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token)) {
            return ["success" => false, "error" => "No token found"];
        }
        $id = $this->validateToken($token);
        if (!$this->hasPermission($id, UserPermission::DeleteUsers)) {
            return ["success" => false, "error" => "You do not have permission to delete users"];
        }


        # Decode ID from hash
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid ID"];
        }
        $id = $id[0];

        # Send query to database
        $sql = "DELETE FROM `users` WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }

        # Check if user was deleted
        if ($this->connection->affected_rows == 0) {
            return ["success" => false, "error" => "No such user"];
        }
        return ["success" => true];
    }


    /**
     * Modify a user in the database
     * @param string $id The ID of the user to modify
     * @param string $username The new username of the user
     * @param string $password The new password of the user
     * @param array $permissions The new permissions of the user
     * @return array An array containing whether the operation was successful
     */
    public function modify(string $id, string $username, string $password, array $permissions): array
    { // Get the token from the cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token)) {
            return ["success" => false, "error" => "No token found"];
        }
        $id = $this->validateToken($token);
        if (!$this->hasPermission($id, UserPermission::ModifyUsers)) {
            return ["success" => false, "error" => "You do not have permission to modify users"];
        }
        // Decode ID
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid ID"];
        }
        $id = $id[0];
        // Check for empty values
        if (empty($username) || empty($password) || empty($permissions)) {
            return ["success" => false, "error" => "Empty username, password or permissions"];
        }
        // Format permissions
        $permissions = implode(";", $permissions);
        // Encrypt password
        $password = crypt($password, $_ENV["HASH_SALT"]);
        // Send query to database
        $sql = "UPDATE `users` SET username = '$username', password = '$password', permissions = '$permissions' WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        return ["success" => true];
    }

    /**
     * Get a user from the database
     * @param string $id The ID of the user to get
     * @return array An array containing the user and whether the operation was successful
     */
    public function get(string $id): array
    { // Get the token from the cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token)) {
            return ["success" => false, "error" => "No token found"];
        }
        $id = $this->validateToken($token);
        if (!$this->hasPermission($id, UserPermission::ViewUsers)) {
            return ["success" => false, "error" => "You do not have permission to view users"];
        }
        // Decode the ID
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid ID"];
        }
        $id = $id[0];
        // Select the user from the database
        $sql = "SELECT * FROM `users` WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        if ($result->num_rows == 0) {
            return ["success" => false, "error" => "User not found"];
        }
        $row = $result->fetch_assoc();
        // Split the permissions into an array
        $permissions = explode(";", $row["permissions"]);
        // Create the user array to return
        $user = ["id" => $this->hashids->encode($row["id"]), "username" => $row["username"], "permissions" => $permissions];
        return ["success" => true, "user" => $user];
    }

    /**
     * Get a list of users from the database
     * @return array An array containing the users and whether the operation was successful
     */
    public function list(): array
    {
        // Get the token from the cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token)) {
            return ["success" => false, "error" => "No token found"];
        }
        $id = $this->validateToken($token);
        if (!$this->hasPermission($id, UserPermission::ViewUsers)) {
            return ["success" => false, "error" => "You do not have permission to view users"];
        }

        // Get all users from the database
        $sql = "SELECT * FROM `users`";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        $users = [];
        while ($row = $result->fetch_assoc()) {
            // Split the permissions string into an array
            $permissions = explode(";", $row["permissions"]);
            // Add the user to the return array
            $user = ["id" => $this->hashids->encode($row["id"]), "username" => $row["username"], "permissions" => $permissions];
            array_push($users, $user);
        }
        return ["success" => true, "users" => $users];
    }

    /**
     * Login a user
     * @param string $username The username of the user
     * @param string $password The password of the user
     * @return array An array containing the ID of the user and whether the operation was successful
     */
    public function login(string $username, string $password): array
    {
        // Hash the password with the salt
        $password = crypt($password, $_ENV["HASH_SALT"]);
        // Send a query to the database to check if the username and password matches
        $sql = "SELECT * FROM `users` WHERE username = '$username' AND password = '$password'";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        // Fetch the result of the query
        $row = $result->fetch_assoc();
        // If the query fails, return an error
        if ($result->num_rows == 0) {
            return ["success" => false, "error" => "Invalid username or password"];
        }
        // If the query succeeds, return a success message, the user's ID, and a token
        $id = $this->hashids->encode($row["id"]);
        $permissions = explode(";", $row["permissions"]);
        $token = $this->createToken($row["username"], $row["password"]);
        $user = ["id" => $this->hashids->encode($row["id"]), "username" => $row["username"], "permissions" => $permissions, "token" => $token];
        return ["success" => true, "user" => $user];
    }

    /**
     * Login a user using cookies
     * @return array An array containing the user and whether the operation was successful
     */
    public function loginCookies(): array
    {
        // Get user token from cookie
        $token = $_COOKIE["auth-token"] ?? null;
        if (empty($token) || $token == null) {
            return ["success" => false, "error" => "No token found"];
        }

        // Validate token
        $id = $this->validateToken($token);
        if (empty($id) || $id == null || $id == "") {
            return ["success" => false, "error" => "Invalid token"];
        }

        // Decode ID
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return ["success" => false, "error" => "Invalid User ID"];
        }
        $id = $id[0];

        // Get user from database
        $sql = "SELECT * FROM `users` WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        $row = $result->fetch_assoc();

        // Get user permissions
        $permissions = explode(";", $row["permissions"]);

        // Return user data
        $user = ["id" => $this->hashids->encode($row["id"]), "username" => $row["username"], "permissions" => $permissions, "token" => $token];
        return ["success" => true, "user" => $user];
    }


    /**
     * Create a token for a user
     * @param string $username The username of the user
     * @param string $password_hash The password hash of the user
     * @return string The token
     */
    private function createToken(string $username, string $password_hash): string
    {
        // Create a hash for the username and password
        $username = crypt($username, $_ENV["HASH_SALT"]);
        $address = crypt($_SERVER["REMOTE_ADDR"], $_ENV["HASH_SALT"]);
        return $username . $password_hash . $address;
    }

    /**
     * Validate a token
     * @param string $token The token to validate
     * @return string The ID of the user
     */
    private function validateToken(string $token): string
    {
        // Query the database for all users
        $sql = "SELECT * FROM `users`";
        $result = $this->connection->query($sql);
        if (!$result) {
            return "";
        }
        // Loop through each user
        while ($row = $result->fetch_assoc()) {
            // Encrypt the username
            $username = crypt($row["username"], $_ENV["HASH_SALT"]);
            // Encrypt the password
            $password = $row["password"];
            // Get the IP address of the user and encrypts it
            $address = crypt($_SERVER["REMOTE_ADDR"], $_ENV["HASH_SALT"]);
            // Concatenate the username, password and IP address
            $ntoken = $username . $password . $address;
            // Check if the token matches the one provided
            if ($token == $ntoken) {
                // Encode the user ID
                return $this->hashids->encode($row["id"]);
            }
        }

        return "";
    }

    /**
     * Check if a user has permission to perform an action
     * @param string $id The ID of the user
     * @param UserPermission $permission The permission to check
     * @return bool Whether the user has permission
     */
    public function hasPermission(string $id, UserPermission $permission): bool
    {
        // Decode the ID
        $id = $this->hashids->decode($id);
        if (empty($id)) {
            return false;
        }
        $id = $id[0];
        // Get the user from the database
        $sql = "SELECT * FROM `users` WHERE id = $id";
        $result = $this->connection->query($sql);
        if (!$result) {
            return false;
        }
        $row = $result->fetch_assoc();
        // Get the user's permissions
        $permissions = explode(";", $row["permissions"]);


        // Check if the user has the permission or is an admin
        return in_array(UserPermission::All, $permissions) || in_array($permission, $permissions);
    }

    private function createAdminAccount()
    {
        // Get all users from the database
        $sql = "SELECT * FROM `users`";
        $result = $this->connection->query($sql);
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
        if ($result->num_rows != 0) {
            return;
        }

        $password = crypt("admin", $_ENV["HASH_SALT"]);

        // Create the SQL query
        $sql = "INSERT INTO `users` (username, password, permissions) VALUES ('admin', '$password', '0')";
        // Send the query to the database
        $result = $this->connection->query($sql);
        // Check if the query was successful
        if (!$result) {
            return ["success" => false, "error" => "Failed to send query to database 'users'"];
        }
    }
}
