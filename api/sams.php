<?php
die();
require_once $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';
$connection = new mysqli("pricing.mardens.com", "drew", "admin", "samsclub");
$text = file_get_contents("https://fm.mardens.com/fmdata/json_sams3.txt");
$json = \JsonMachine\Items::fromString($text, ["pointer" => "/data"]);
$items = iterator_to_array($json);


foreach($items as $item){
    $catNum = $item->catNum;
    $category = str_replace("'", "''", $item->category);
    $clthgrp = $item->clthgrp;
    $descpt = str_replace("'", "''", $item->descpt);
    $itemNum = $item->itemNum;
    $mp = $item->mp;
    $retail = $item->retail;
    $upc = $item->upc;

    $sql = "INSERT INTO `sams-club-usa` (`catNum`, `category`, `clthgrp`, `descpt`, `itemNum`, `mp`, `retail`, `upc`) VALUES ('$catNum','$category','$clthgrp','$descpt','$itemNum','$mp','$retail','$upc')";
    $result = $connection->query($sql);
    if(!$result){
        echo $connection->error;
    }
}