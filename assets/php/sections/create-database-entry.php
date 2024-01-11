<div class="popup" id="create-database-entry-popup">
    <div class="popup-content center vertical col">
        <div class="popup-header row center vertical">
            <div class="title fill">Create Database Entry</div>
            <button class="close">x</button>
        </div>
        <div class="popup-body">
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
</div>