async function buildInventoryingForm(allowAdditions, columns) {
    try {
        $("main > .list").addClass('row')
        $("main > .list").removeClass('col')

        const inventoryingForm = $(`<form id="inventorying-form" class="col fill" action="javascript:void(0);"></form>`);

        inventoryingForm.append(`<h1>Inventorying</h1>`);
        const primaryKeyColumn = columns.filter(column => column.attributes.includes('primary'));
        const quantityColumn = columns.filter(column => column.attributes.includes('quantity'));
        if (primaryKeyColumn.length === 0) {
            inventoryingForm.append(`<p>Primary key column not found</p>`);
        }
        if (quantityColumn.length === 0) {
            inventoryingForm.append(`<p>Quantity column not found</p>`);
        }
        if (primaryKeyColumn.length === 0 || quantityColumn.length === 0) {
            inventoryingForm.append(`<p>Missing required fields, add them in the <a href="javascript:void();" onclick="$('#edit-button').trigger('click')">"Database Settings"</a> section</p>`);
            return inventoryingForm;
        }

        const primaryKey = primaryKeyColumn[0].name;
        const quantity = quantityColumn[0].name;


        const primaryInput = $(`
            <div class="floating-input">
                <input type="text" id="primary-key" name="primary-key" required placeholder="" autocomplete="off">
                <label for="primary-key">${primaryKey} <i class="fa-solid fa-key"></i></label>
            </div>`)

        const quantityInput = $(`
            <div class="floating-input">
                <input type="text" id="quantity" name="quantity" required placeholder="" autocomplete="off">
                <label for="primary-key">${quantity}</label>
            </div>`)

        const submitButton = $(`<button type="submit" class="fill primary center horizontal vertical">Update</button>`);
        const addToggle = $(`<toggle id="add-item" value="false">Add?</toggle>`);
        const additionSection = $(`<section id="addition-section" class="col fill" toggle-hidden="add-item"></section>`);
        for (const column of columns) {
            if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
            const input = $(`
                <div class="floating-input">
                    <input type="text" id="${column.name}" name="${column.name}" placeholder="" autocomplete="off">
                    <label for="${column.name}">${column.name}</label>
                </div>`);
            additionSection.append(input);
        }

        inventoryingForm.append(primaryInput);
        inventoryingForm.append(quantityInput);
        if (allowAdditions) {
            inventoryingForm.append(addToggle);
            inventoryingForm.append(additionSection);
        }
        inventoryingForm.append(submitButton);

        addToggle.on("toggle", (e, data) => {
            const value = data.value;
            if (value) {
                if (addToggle.text() === "Add?")
                    submitButton.text("Add")
                const inputs = additionSection.find("input");
                for (const input of inputs) {
                    $(input).prop('required', true);
                }
                inputs.val('');

            } else {
                submitButton.text("Update")
                const inputs = additionSection.find("input");
                for (const input of inputs) {
                    $(input).prop('required', false);
                }
                inputs.val('');
            }
        });

        $(document).on("item-selected", (e, item) => {

            if (item === null || item === undefined) {
                primaryInput.find("input").val("");
                quantityInput.find("input").val("");
                if (allowAdditions) {
                    addToggle.text("Add?");
                    if (addToggle.attr('value') === "true") {
                        submitButton.text("Add")
                    }
                    for (const column of columns) {
                        if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                        additionSection.find(`#${column.name}`).val("");
                    }
                }

                return;
            }

            primaryInput.find("input").val(item[primaryKey]);
            quantityInput.find("input").val(item[quantity]);
            addToggle.text("Edit?");
            submitButton.text("Update")

            if (allowAdditions) {
                for (const column of columns) {
                    if (column.attributes.includes('primary') || column.attributes.includes('quantity') || column.attributes.includes('readonly')) continue;
                    additionSection.find(`#${column.name}`).val(item[column.name]);
                }
            }
        });

        inventoryingForm.append($(`<link rel="stylesheet" href="assets/css/inventory-form.css">`))
        return inventoryingForm;
    } catch (error) {
        console.error(error);
        return $("<p>Failed to load inventorying form</p>");
    }
}

function addItem() {
    const form = $('#inventorying-form');

}


export {buildInventoryingForm}