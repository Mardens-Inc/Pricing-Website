<div class="popup" id="create-pricing-entry-popup">
    <div class="popup-content center vertical col">
        <div class="popup-header row center vertical">
            <div class="title fill">Add Price(s)</div>
            <button class="close">x</button>
        </div>
        <div class="popup-body">
            <div class="row">
                <form class="form-input">
                    <div class="drag-drop-area" id="upload-pricing-data" accept="*.xlsx, *.csv"></div>
                    <div id="comparison-form" class="col fill">
                    </div>

                    <button id="upload-pricing-data-button">Upload</button>
                </form>
                <h2>OR</h2>
                <form class="form-input">
                    <h3>Import from Filemaker</h3>
                    <label for="filemaker-db">Database</label>
                    <select name="filemaker-db" id="filemaker-db">
                        <option value="none">None</option>
                    </select>
                    <label for="filemaker-layout">Table</label>
                    <select name="filemaker-layout" id="filemaker-layout">
                        <option value="none">None</option>
                    </select>
                </form>
            </div>
        </div>
    </div>
</div>