var fileData = {};
var fileList = [];
var idCounter = 0;
var curCode = 0;

function getFileList() {
    return fileList;
}

function getFileData(id) {
    return fileData[id];
}

function editFile(id, code) {
    fileData[id] = code;
}

function addFile(name, code) {
    idCounter++;
    editFile(idCounter, code);
    fileList.push([idCounter, name]);
    return idCounter;
}

function updateList() {
    var list = document.getElementById("filelist");
    while (list.options.length > 0) list.remove(0);
    for (var index in fileList) {
        var newItem = document.createElement("option");
        newItem.value = fileList[index][0];
        newItem.text = fileList[index][1];
        list.add(newItem);
    }
    //for (
}

function newCode() {
    editor.setValue("");
    curCode = 0;
}

function loadFile(id) {
    var list = document.getElementById("filelist");
    editor.setValue(fileData[list.value]);
    curCode = list.value;
}

function saveCode() {
    if (curCode == 0) {
        var name = prompt("Enter code name:");
        curCode = addFile(name, editor.getValue());
        updateList();
    } else {
        editFile(curCode, editor.getValue());
    }
}

function deleteCode() {
    var list = document.getElementById("filelist");
    var badItem = list.value;
    var newList = [];
    for (var index in fileList) {
        if (fileList[index][0] != badItem) newList.push(fileList[index]);
    }
    fileList = newList;
    updateList();
}

//addFile("eka", "apina\nbanaani\ncembalo\n");
//addFile("toka", "moikka!");
//addFile("kolmas", "heippa!");
//ADD