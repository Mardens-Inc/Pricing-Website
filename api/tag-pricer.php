<?php

use Slim\Factory\AppFactory;

require_once $_SERVER["DOCUMENT_ROOT"] . "/vendor/autoload.php";
$app = AppFactory::create();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);
$app->setBasePath("/api/tag-pricer");

$app->get("/", function ($request, $response, $args)
{
    $response->getBody()->write(json_encode(
        [
            "routes" => [
                "/percent" => [
                    "params" => [
                        "department" => "string",
                        "year" => "int",
                        "percent" => "float",
                        "price" => "float"
                    ],
                    "name" => "Generic Percent Off",
                    "description" => "Prints a price tag with a percent off"
                ],
                "/amazon/white" => [
                    "params" => [
                        "department" => "string",
                        "label" => "string",
                        "year" => "int",
                        "price" => "float"
                    ],
                    "name" => "Amazon White Label",
                    "description" => "Prints a price tag for Amazon with a white background"
                ],
                "/eyewear" => [
                    "params" => [
                        "price" => "float"
                    ],
                    "name" => "Eyewear",
                    "description" => "Prints a price tag for eyewear"
                ],
                "/sams" => [
                    "params" => [
                        "price" => "float",
                        "mp" => "float"
                    ],
                    "name" => "Sams Club",
                    "description" => "Prints a price tag for Sam's Club"
                ]
            ]
        ]));
    return $response->withHeader("Content-Type", "application/json");
});

$app->get("/percent", function ($request, $response, $args)
{
    $params = $request->getQueryParams();
    $department = @$params["department"] ?? "";
    $year = @$params["year"] ?? "";
    $percent = -1 * $params["percent"] + 1;
    $price = number_format($params["price"], 2);

    $mp = number_format($price * $percent, 2);

    $response->getBody()->write("
<body style='margin:0; font-size:5pt'>
<div style='font-family: verdana,sans-serif;width: 110px; height: 78px; text-align: center; margin-left: 7px; margin-top: 2px;'>
    <div style='font-size: 8pt; font-weight: Bold; padding-top: 6px; padding-left: 6px; padding-bottom: -7px; line-height: 4px; text-align: left;'>Dept: $department</div>
    <p style='font-size: 8pt; font-weight: Bold; padding-left: 3px; padding-bottom: -5px; line-height: 6px; text-align: right;'>Retail Price</p>
    <div style='font-size: 13pt; font-weight: Bold; padding-left: 3px; padding-bottom: 2px; line-height: 2px;'>$$price</div>
    <p style='font-size: 8pt; font-weight: Bold; padding-left: 3px; padding-bottom: -5px; line-height: 6px; text-align: right;'>Marden's Price</p>
    <div style='font-size: 13pt; font-weight: Bold; line-height: 2px;'> 
        $$mp 
        <p style='font-size: 8pt; font-weight: Bold; padding-left: 3px; padding-bottom: -5px; line-height: 6px; text-align: right;'>$year</p>
    </div>
</div>
</body>
");
    return $response->withHeader("Content-Type", "text/html");
});

$app->get("/amazon/white", function ($request, $response, $args)
{
    $params = $request->getQueryParams();
    $department = @$params["department"] ?? "";
    $label = @$params["label"] ?? "";
    $year = @$params["year"] ?? "";
    $price = number_format($params["price"], 2);

    $response->getBody()->write("
<body style='margin:0; font-size:5pt'>
<div style='font-family: verdana,sans-serif;width:110px; height: 73px; text-align: center; margin-left:0; margin-top: 0; overflow: hidden;'>
    <div  style='font-size:8pt; font-weight: Bold; padding-top:6px; padding-left: 6px; padding-bottom: -7px; line-height: 4px; text-align: left;'>Dept: $department</div>
    <p  style='font-size: 8pt; font-weight: Bold; line-height: 9px;'>$label</p>
    <div style='font-size: 11pt; font-weight: Bold; line-height: 4px;'>
        $$price 
        <p class='LotNum' style='font-size:8pt; font-weight: Bold; line-height: 6px; text-align: right; padding-right: 5px;'>$year</p>
    </div>
</div>
</body>
");
    return $response->withHeader("Content-Type", "text/html");
});
$app->get("/eyewear", function ($request, $response, $args)
{
    $params = $request->getQueryParams();
    $price = number_format($params["price"], 2);

    $response->getBody()->write("
<body style='font-family: Roboto, sans-serif;margin:0;'>
<div style='width: 110px; height: 78px; text-align: center; margin-left: 7px; margin-top: 0;'>
    <div style='transform: rotate(180deg); padding-bottom: 5px; -webkit-transform: rotate(180deg); -moz-transform: rotate(180deg); -ms-transform: rotate(180deg); -o-transform: rotate(180deg);'>
        <p style='font-size: 8pt; font-weight: Bold; padding-left: 3px; padding-bottom: -5px; line-height: 6px; text-align: right;'>Marden's Price</p>
        <div style='font-size: 13pt; font-weight: Bold; line-height: 2px;'>$$price</div>
    </div>
    <div style='margin-top: 27px;'>
        <p style='font-size: 8pt; font-weight: Bold; padding-left: 3px; padding-bottom: -5px; line-height: 6px; text-align: right;'>Marden's Price</p>
        <div style='font-size: 13pt; font-weight: Bold; line-height: 2px;'>$$price</div>
    </div>
</div>
</body>

");
    return $response->withHeader("Content-Type", "text/html");
});
$app->get("/sams", function ($request, $response, $args)
{
    $params = $request->getQueryParams();
    $price = number_format($params["price"], 2);
    $mp = number_format($params["mp"], 2);

    $response->getBody()->write("
<body style='font-family: verdana, serif, sans-serif;margin:0;'>
<div style='width: 110px; height: 78px; text-align: end; margin-left: 7px; margin-top: 2px;'>
    <p style='font-size: 8pt; margin-bottom: 5px; font-weight: bold;'>Club Price</p>
    <div style='font-size: 10pt; font-weight: Bold; line-height: 2px;'>$$price</div>
    <p style='font-size: 8pt; margin-bottom: 10px; font-weight: bold;'>Mardens Price</p>
    <div style='font-size: 16pt; font-weight: Bold; line-height: 2px;'>$$mp</div>
</div>
</body>

");
    return $response->withHeader("Content-Type", "text/html");
});


$app->run();