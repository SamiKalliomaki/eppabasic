$(function() {
    var notificationSystem = new NotificationSystem('#notification-box');
    var editor = new Editor('editor', document.getElementById('manual'));
    var userControlsController = new UserControlsController('#user-controls');
    var fileDialogController = new FileDialogController('#file-dialog-wrapper', notificationSystem);
    var fileControlsController = new FileControlsController('#file-controls', editor, userControlsController, fileDialogController, notificationSystem);
    var codeControlsController = new CodeControlsController('#code-controls', editor);
    var manual = new Manual('#manual', 'fi');

    manual.openPage('index');

    window.ebeditor = editor;

    $('#editor').resizable({
        resize: function(e, ui) {
            $('#manual').css('margin-left', ui.size.width + 2);
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
