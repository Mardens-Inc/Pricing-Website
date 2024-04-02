<?php

class Client
{
    /**
     * Uploads a file to the specified version directory in the clients directory.
     *
     * @param mixed $file The file data to be uploaded. It must have 'name' key representing the original file name and 'tmp_name' key representing the temporary file path.
     * @param string $version The version of the file to be uploaded. It is used to create the directory path where the file will be stored.
     * @return bool Returns true if the file is successfully uploaded, otherwise throws an exception.
     * @throws Exception If failed to move the file to the destination directory.
     */
    public function upload_version(mixed $file, string $version): bool
    {
        $file_name = $file['name'];
        $file_tmp = $file['tmp_name'];
        $directory = $_SERVER['DOCUMENT_ROOT'] . "/downloads/clients/$version/";
        $file_destination = "$directory/$file_name";

        // create the version directory if it does not exist
        if (!file_exists($directory)) {
            mkdir($directory, 0777, true);
        }

        // move the uploaded file to the destination directory
        if (!move_uploaded_file($file_tmp, $file_destination)) {
            throw new Exception("Failed to upload file");
        }


        return true;
    }

    /**
     * Retrieves all versions available in the clients directory.
     *
     * @return array Returns an array containing all available versions in the clients directory.
     */
    public function get_versions(): array
    {
        $versions = array_diff(scandir($_SERVER['DOCUMENT_ROOT'] . "/downloads/clients"), array('..', '.'));
        return array_values($versions);
    }

}