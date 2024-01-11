<?php
$name = $_GET['title'];
$showRetail = isset($_GET['retail']);
if ($showRetail) $price = $_GET['retail'];
$nonTaxable = isset($_GET['nonTaxable']);
$mardensPrice = $_GET['price'];
?>
<!DOCTYPE HTML>
<html>

<head>
    <title>Print</title>
    <link rel="stylesheet" href="/assets/css/print.min.css">
</head>

<body>
    <div id="box">
        <b style="white-space: nowrap;"><?php if ($nonTaxable) echo "<div class=\"DEPT\">Dept: 14</div>"; ?>
            <?php echo $name; ?></br></b>
        <?php
        if ($showRetail) echo "<div class=\"RP\">" . number_format((float)$price, 2, '.', '') . "</div><div class=\"MP-title\">Mardens Price</div>";
        ?>
        <div class="MP">
            <?php echo "$" . number_format((float)$mardensPrice, 2, '.', ''); ?>
        </div>
    </div>
    <script type="text/javascript">
        window.print()
        window.onblur = () => window.close();
        window.onfocus = () => window.close();
        window.onload = () => setTimeout(() => window.close(), 1000);
    </script>
</body>

</html>