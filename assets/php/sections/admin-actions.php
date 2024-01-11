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
                    <!-- <th>Actions</th> -->
                </tr>
            </thead>
            <tbody>
                <tr onclick="openCreateDatabaseEntryPopup()">
                    <td>Create a new Database Entry</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr class="only-on-list-view" onclick="showAddPricingListItem()">
                    <td>Add Price(s)</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr class="only-on-list-view" onclick="showEditPricingListOptions()">
                    <td>Edit Options</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr class="only-on-list-view" onclick="database.deleteList()">
                    <td>Delete Pricing List</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr class="only-on-list-view" onclick="database.deleteAllRows()">
                    <td>Delete All Rows</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr class="logout">
                    <td>Logout</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
            </tbody>
        </table>
    </div>
</div>