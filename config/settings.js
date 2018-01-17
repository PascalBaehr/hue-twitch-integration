//Created by mkafr on 1/16/2018.

const path = require('path');
const fs = require('fs');
const schema = require('./schema.json');

const options = {
    theme: 'bootstrap3',
    iconlib: 'fontawesome4',
    disable_array_reorder: true,
    disable_collapse: true,
    disable_edit_json: true,
    disable_properties: true,
    disable_array_delete_all_rows: true,
    disable_array_delete_last_row: true,
    schema: schema,
};

let element = document.getElementById("editor-holder");
let saveBtn = document.getElementById("saveBtn");
let editor = new JSONEditor(element, options);

if(fs.existsSync(__dirname + '/settings.json')) {
    let settings = require(__dirname + '/settings.json');
    editor.setValue(settings);
}

saveBtn.onclick = function () {
    let data = editor.getValue();
    fs.writeFileSync(__dirname + '/settings.json', JSON.stringify(data, null, 2));
};
