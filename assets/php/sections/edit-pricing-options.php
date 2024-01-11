<style>
    .extra-section {
        margin-bottom: 1rem;
        background-color: rgba(0, 0, 0, .08);
        padding: 1rem;
    }
</style>

<div class="popup" id="edit-pricing-options-popup">
    <div class="popup-content center vertical col">
        <div class="popup-header row center vertical">
            <div class="title fill">Edit Options</div>
            <button class="close">x</button>
        </div>
        <div class="popup-body">

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
                <div class="print-form fill extra-section col" style="display:none">
                    <div class="row fill">
                        <div class="col fill" style="margin-right: 5px">
                            <label for="print-label">Print Label</label>
                            <input type="text" name="print-label" placeholder="Print Label" tabindex="4">
                        </div>
                        <div class="col fill" style="margin-left: 5px">
                            <label for="print-year">Print Year</label>
                            <input type="text" name="print-year" placeholder="Print Year" tabindex="5">
                        </div>
                    </div>
                    <div class="row fill">
                        <div class="col fill" style="margin-left: 5px">
                            <label for="print-price-column">Print Price Column</label>
                            <select name="print-price-column" id="print-price-column">
                            </select>
                        </div>
                        <div class="col fill" style="margin-left: 5px">
                            <label for="print-retail-price-column">Print Retail Price Column</label>
                            <select name="print-retail-price-column" id="print-retail-price-column">
                            </select>
                        </div>
                    </div>
                    <toggle name="print-show-retail" value="true">Show Retail Price?</toggle>
                </div>
                <toggle name="show-date" value="false">Show Date Column?</toggle>
                <toggle name="voice-search" value="false">Enable voice searching?</toggle>

                <div class="voice-form fill extra-section" style="display:none;">
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
</div>