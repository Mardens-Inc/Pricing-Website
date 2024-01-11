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
                    <!-- <th>Actions</th> -->
                </tr>
            </thead>
            <tbody>
                <tr id="print-button" onclick="print()">
                    <td>Print Entry</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr id="edit-entry-button" onclick="openEditListItem();">
                    <td>Edit Entry</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
                <tr id="delete-entry-button">
                    <td>Delete Entry</td>
                    <!-- <td><button>Action</button></td> -->
                </tr>
            </tbody>
        </table>
    </div>
</div>