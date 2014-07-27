$(function() {
    var notificationSystem = new NotificationSystem('#notification-box');
    var editor = new Editor('editor', document.getElementById('manual'));
    var userControlsController = new UserControlsController('#user-controls');
    var fileDialogController = new FileDialogController('#file-dialog-wrapper', notificationSystem);
    var fileControlsController = new FileControlsController('#file-controls', editor, userControlsController, fileDialogController, notificationSystem);
    var codeControlsController = new CodeControlsController('#code-controls', editor);
    var pasteControlsController = new PasteControlsController('#paste-controls', '#share-dialog-wrapper', editor, notificationSystem);
    var manual = new Manual('#manual', 'fi');

    manual.openPage('index');

    window.ebeditor = editor;

    i18n.init(function(t) {
      $('body').i18n();
    });

    $('#editor').resizable({
        resize: function(e, ui) {
            $('#manual').css('margin-left', ui.size.width + 2);
        },
        handles: "e"
    });

    $('.dialog-wrapper').click(function(e) {
        if(e.target !== this)
            return;

        $(this).hide();
    });

    // Tell user about page reload
    window.onbeforeunload = function(e) {
        var msg = i18n.t('confirm-leave');

        e.returnValue = msg;
        return msg;
    };
});

