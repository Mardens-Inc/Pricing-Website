import {ActionType, parseJSONToHistoryRecord} from "/assets/js/history.js";
import {getActionTypeString} from "./history.js";

/**
 * Load the history records into the history list
 @param {HistoryRecord[]} records - The records to be loaded into the history list
 */
export default function loadHistoryRecords(records) {

    const historyElement = $("#history-list");
    historyElement.empty();
    console.log(records)

    for (let i = 0; i < records.length; i++) {
        const item = parseJSONToHistoryRecord(records[i]);

        const action = getActionTypeString(item.action_type)
        const icon = item.action_type === ActionType.CREATE ? 'fa-plus-circle' : item.action_type === ActionType.UPDATE ? 'fa-square-pen' : 'fa-ban';

        const html = $(`
                <div class="list-item center vertical fill" type="${action}">
                    <div class="icon" title="Item was ${action}"><i class="fa ${icon}"></i></div>
                    <div class="fill user" >${item.user}</div>
                    <div class="fill date">${item.timestamp.toLocaleString()}</div>
                    <div>
                        <button class="view-history" title="View changed data"><i class="fa fa-eye"></i></button>
                    </div>
                </div>
`);
        $(html).on('click', () => {
            historyElement.find('.active').removeClass('active');
            html.addClass('active');
            // console.log(item)
            if (item["record_id"] !== undefined && item["record_id"] !== null) {
                const filteredItems = records.filter(x => x.record_id === item.record_id);
                const indexOfSelectedItem = filteredItems.findIndex(x => x.data === item.data);
                viewDetailedHistory(filteredItems, indexOfSelectedItem);
            } else {
                viewDetailedHistory(records, i);
            }
        });
        historyElement.append(html);
    }

    function viewDetailedHistory(items, selectedItemIndex) {
        console.log(selectedItemIndex)
        console.log(items)
        let difference = ' ';
        const appendDifference = (key, prev, curr) => {
            difference += `<div>${key}: <div class="content"><span class="old">${prev !== undefined && prev !== null ? prev : '?'}</span> <i class="fa-solid fa-arrow-right"></i> <span class="new">${curr}</span></div></div>`;
        };

        // calculated the difference between the selected item in the items array and the next item in the array
        const item = items[selectedItemIndex];
        for (const key in item.data) {
            if (item.data.hasOwnProperty(key)) {
                const previous = selectedItemIndex !== items.length - 1 ? items[selectedItemIndex + 1] : null;
                const prev = previous && previous.data[key];
                const curr = item.data[key];
                if (prev !== curr || selectedItemIndex === items.length - 1) {
                    appendDifference(key, prev, curr);
                }
            }
        }
        const viewRecordButton = $(`<button id="view-record-button">View Record</button>`);
        viewRecordButton.on('click', () => {
            console.log(item);
            $(document).on("finishedLoadingExternalView", () => {
                $(document).trigger('search', item.record_id);
            });
            $(document).trigger('loadExternalView', item.location_id);
        });

        $("#extended-history-view").css('display', '').html(`<h2>Changed Data</h2>${difference}`).append(viewRecordButton);
    }
}

$(document).trigger('load')