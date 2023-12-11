<?php

require $_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Reader\Xlsx;

function convertExcelToJson($excelFilePath, $jsonFilePath)
{
    $spreadsheet = (new Xlsx())->load($excelFilePath);
    $worksheet = $spreadsheet->getActiveSheet();

    $weirdData = [];

    foreach ($worksheet->getRowIterator() as $row) {
        $rowData = [];
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false);

        foreach ($cellIterator as $cell) {
            $rowData[] = $cell->getValue();
        }

        $weirdData[] = $rowData;
    }

    $data = [];

    $rowCount = count($weirdData[0]);
    for ($i = 0; $i < count($weirdData); $i++) {
        for ($j = 0; $j < $rowCount; $j++) {
            $data[$i][$weirdData[1][$j]] = $weirdData[$i+2][$j];
        }
    }


    $jsonContent = json_encode($data, JSON_PRETTY_PRINT);

    file_put_contents($jsonFilePath, $jsonContent);
}

// Example usage
$excelFilePath = $_SERVER['DOCUMENT_ROOT'] . '/test.xlsx';
$jsonFilePath = $_SERVER['DOCUMENT_ROOT'] . '/test.json';

convertExcelToJson($excelFilePath, $jsonFilePath);
