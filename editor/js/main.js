$(function() {
    var editor = new Editor('editor', document.getElementById('manual'));
    var userControlsController = new UserControlsController('#user-controls');
    var fileDialogController = new FileDialogController('#file-dialog-wrapper');
    var fileControlsController = new FileControlsController('#file-controls', editor, userControlsController, fileDialogController);
    var codeControlsController = new CodeControlsController('#code-controls', editor);
    window.ebeditor = editor;

    $('#editor').resizable({
        resize: function(e, ui) {
            ui.element.css("flex-basis", ui.size.width);
        },
        handles: "e"
    });

    // Tell user about page reload
    window.onbeforeunload = function(e) {
        var msg = "Are you sure you want to leave this page? All your code is lost.";

        e.returnValue = msg;
        return msg;
    };
});
