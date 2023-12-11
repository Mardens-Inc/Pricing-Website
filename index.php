<!DOCTYPE html>
<html lang="en">

<head>
    <!-- Metadata -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pricing Database Directory</title>
    <link rel="shortcut icon" href="/assets/images/favicon.png" type="image/x-icon">

    <!-- CSS Styling -->
    <link rel="stylesheet" href="/assets/css/voice.min.css">
    <link rel="stylesheet" href="/assets/css/home.min.css">
    <link rel="stylesheet" href="/assets/css/tables.min.css">
    <link rel="stylesheet" href="/assets/css/popups.min.css">
    <link rel="stylesheet" href="/assets/css/inputs.min.css">
    <link rel="stylesheet" href="/assets/css/main.min.css">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

    <!-- FontAwesome -->
    <script src="/assets/lib/fontawesome-free-6.5.1-web/js/all.min.js" defer></script>

    <!-- SheetJS for Excel Parsing -->
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>

    <!-- Setup JS Classes -->
    <script src="/assets/js/database.js"></script>
    <script src="/assets/js/authentication.min.js"></script>
    <script src="/assets/js/parsing.js"></script>

</head>

<body>

    <nav>
        <button id="admin-login" class="secondary">Administrator</button>
        <button id="directory-button" class="only-on-list-view">Database Directory</button>
    </nav>
    <div id="content" class="col center horizontal fill">
        <div class="row">
            <img id="logo-image" src="/assets/images/logo.svg" alt="">
            <h1 id="page-header">Pricing Database Directory</h1>
        </div>
        <hr>
        <div class="row">
            <div id="count-area" class="row fill center vertical">
                <span>Show </span>
                <select name="entries" id="entries">
                    <option value="10" selected>10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span> entries</span>
            </div>
            <div id="search-area" class="row fill">
                <input type="search" name="search" id="search" placeholder="Type to filter results" title="search input">
                <button id="clear-search" title="Clear search">x</button>
            </div>
        </div>

        <div class="row">
            <table class="search-table"> </table>
        </div>
        <span id="showing-message" class="fill"></span>
        <div class="pagination row center horizontal vertical fill"></div>
    </div>


    <!-- POPUPS ZONE -->
    <div id="admin-login-popup" class="popup">
        <div class="popup-content">
            <div class="popup-header row center vertical">
                <div class="title fill">Admin Login</div>
                <button class="close">x</button>
            </div>

            <div class="form-input col center horizontal">
                <label for="username">Username</label>
                <input type="text" name="username" id="username" placeholder="Username" autocomplete="username">
            </div>
            <div class="form-input col center horizontal">
                <label for="password">Password</label>
                <input type="password" name="password" id="password" placeholder="Password" autocomplete="current-password">
            </div>
            <p id="login-error" class="error center horizontal"></p>
            <div class="row center horizontal">
                <button class="login">Login</button>
            </div>
        </div>
    </div>
    <div id="admin-actions-popup" class="popup">
        <div class="popup-content center horizontal">
            <div class="popup-header row center vertical">
                <div class="title fill">Admin Actions</div>
                <button class="close">x</button>
            </div>
            <table id="admin-action">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr onclick="openCreateDatabaseEntryPopup()">
                        <td>Create a new Database Entry</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr class="only-on-list-view" onclick="showAddPricingListItem()">
                        <td>Add Price(s)</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr class="only-on-list-view" onclick="showEditPricingListOptions()">
                        <td>Edit Options</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr class="only-on-list-view" onclick="database.deleteList()">
                        <td>Delete Pricing List</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr class="only-on-list-view" onclick="database.deleteAllRows()">
                        <td>Delete All Rows</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr class="logout">
                        <td>Logout</td>
                        <td><button>Action</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="popup" id="create-database-entry-popup">
        <div class="popup-content center vertical col">
            <div class="popup-header row center vertical">
                <div class="title fill">Create Database Entry</div>
                <button class="close">x</button>
            </div>
            <form class="form-input">
                <label for="upload-row-data">Upload Pricing Data (OPTIONAL)</label>
                <div class="drag-drop-area" id="upload-row-data" accept="*.xlsx, *.csv"> </div>
                <label for="icon-list">Icon</label>
                <div class="list" id="icon-list" name="icon-list"></div>
                <label for="name">Name</label>
                <input type="text" name="name" placeholder="Name" tabindex="1" required>
                <label for="location">Location</label>
                <input type="text" name="location" placeholder="Location" tabindex="2" required>
                <label for="po">PO#</label>
                <input type="text" name="po" placeholder="PO#" tabindex="3" required>
                <label for="rows">Rows</label>
                <input class="fill" type="text" name="rows" placeholder="Rows" tabindex="4">
                <span class="row-items"></span>
                <p class="error center horizontal"></p>
                <button type="submit" tabindex="5">Add</button>
            </form>
        </div>
    </div>

    <div class="popup" id="create-pricing-entry-popup">
        <div class="popup-content center vertical col">
            <div class="popup-header row center vertical">
                <div class="title fill">Add Price(s)</div>
                <button class="close">x</button>
            </div>
            <form class="form-input">
                <div class="drag-drop-area" id="upload-pricing-data" accept="*.xlsx, *.csv"> </div>
                <div id="comparison-form" class="col fill">
                </div>

                <button id="upload-pricing-data-button">Upload</button>
            </form>
        </div>
    </div>


    <div class="popup" id="edit-pricing-options-popup">
        <div class="popup-content center vertical col">
            <div class="popup-header row center vertical">
                <div class="title fill">Edit Options</div>
                <button class="close">x</button>
            </div>
            <form class="form-input">
                <label for="icon-list">Icon</label>
                <div class="list" id="icon-list" name="icon-list"></div>
                <label for="name">Name</label>
                <input type="text" name="name" placeholder="Name" tabindex="1" required>
                <label for="location">Location</label>
                <input type="text" name="location" placeholder="Location" tabindex="2" required>
                <label for="po">PO#</label>
                <input type="text" name="po" placeholder="PO#" tabindex="3" required>
                <toggle name="print" value="true">Can print label?</toggle>
                <div class="print-form fill" style="display:none">
                    <div class="col fill" style="margin-right: 5px">
                        <label for="print-label">Print Label</label>
                        <input type="text" name="print-label" placeholder="Print Label" tabindex="4">
                    </div>
                    <div class="col fill" style="margin-left: 5px">
                        <label for="print-year">Print Year</label>
                        <input type="text" name="print-year" placeholder="Print Year" tabindex="5">
                    </div>
                    <div class="col fill" style="margin-left: 5px">
                        <label for="print-price-column">Print Price Column</label>
                        <select name="print-price-column" id="print-price-column">
                        </select>
                    </div>
                </div>
                <toggle name="voice-search" value="false">Enable voice searching?</toggle>
                
                <div class="voice-form fill" style="display:none;margin-bottom: 1rem;">
                    <div class="col fill" style="margin-right: 5px">
                        <label for="voice-description-column">Title/Description Column</label>
                        <select name="voice-description-column" id="voice-description-column">
                        </select>
                    </div>
                    <div class="col fill" style="margin-left: 5px">
                        <label for="voice-price-column">Price Column</label>
                        <select name="voice-price-column" id="voice-price-column">
                        </select>
                    </div>
                </div>
                <button id="save-pricing-options-button" onclick="editPricingListOptions()">Save</button>
            </form>
        </div>
    </div>


    <div class="popup" id="list-item-options-popup">
        <div class="popup-content center vertical col">
            <div class="popup-header row center vertical">
                <div class="title fill">Actions</div>
                <button class="close">x</button>
            </div>

            <table id="admin-action">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr id="print-button" onclick="print()">
                        <td>Print Entry</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr>
                        <td>Edit Entry</td>
                        <td><button>Action</button></td>
                    </tr>
                    <tr>
                        <td>Delete Entry</td>
                        <td><button>Action</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="popup" id="voice-search-popup">
        <div class="voice-notification">
            <i class="fa-solid fa-microphone"></i>
            <p>Listening...</p>
            <div class="search-result">
                <p id="voice-showing-message"></p>
                <table class="search-table">
                    <thead>
                        <tr>
                        </tr>
                    </thead>
                    <tbody id="voice-table-body">
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="popup no-close" id="loading-popup">
        <div class="col center horizontal vertical" style="color: white; height: 100%; transform: translateY(-200px)">
            <h1 style="font-size: 6rem; margin-bottom: 0;">Loading</h1>
            <h4 style="font-size: 2rem; margin-top: 0;">Please Wait</h4>
        </div>
        <div class="loading"></div>
    </div>



    <script src="/assets/js/authorization.min.js"></script>
    <script src="/assets/js/directory.min.js"></script>
    <script src="/assets/js/inputs.min.js"></script>
    <script src="/assets/js/voice-search.min.js"></script>
    <?php
    echo "<script>
    database.keyword = \"" . (isset($_GET['q']) ? $_GET["q"] : "") . "\";
    database.sort = \"" . (isset($_GET['sort']) ? $_GET["sort"] : "id") . "\";
    database.ascending = " . (isset($_GET['asc']) ? "true" : "false") . ";
    database.page = " . (isset($_GET['page']) ? $_GET['page'] : "0") . ";
    database.list = \"" . (isset($_GET['list']) ? $_GET['list'] : "") . "\";
    database.limit = " . (isset($_GET['limit']) ? $_GET['limit'] : "10") . ";
    $(\"#search\").val(database.keyword);
    $(\"#entries\").val(database.limit);
    database.load(database.limit, database.page, database.sort, database.ascending, database.keyword, database.list);
    </script>";
    ?>
</body>

</html>