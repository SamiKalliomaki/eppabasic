$(function () {
    var notificationSystem = new NotificationSystem('#notification-box');
    var editor = new Editor('editor');
    var userControlsController = new UserControlsController('#user-controls');
    var fileDialogController = new FileDialogController('#file-dialog-wrapper', notificationSystem);
    var fileControlsController = new FileControlsController('#file-controls', editor, userControlsController, fileDialogController, notificationSystem);
    var codeControlsController = new CodeControlsController('#code-controls', editor);
    var pasteControlsController = new PasteControlsController('#paste-controls', '#share-dialog-wrapper', editor, notificationSystem);
    var manual = new Manual('#manual-container', 'fi');

    manual.openPage('index');

    window.ebeditor = editor;

    i18n.init({ lng: 'fi-FI' }, function (t) {
        $('#language-selection').val(i18n.options.lng);

        $('#language-selection').change(function () {
            i18n.setLng($('#language-selection').val(), function (t) {
                $('body').i18n();
            });
        });

        $('body').i18n();
    });

    $('#editor').resizable({
        resize: function (e, ui) {
            $('#manual').css('margin-left', ui.size.width + 2);
        },
        handles: "e"
    });

    $('.dialog-wrapper').click(function (e) {
        if (e.target !== this)
            return;

        $(this).hide();
    });

    // Restore save code
    if (sessionStorage && sessionStorage.getItem('code')) {
        editor.setCode(sessionStorage.getItem('code'));
    }
    // Save code to sessionStorage if possible
    // Otherwise just show a message telling that the code will be lost
    window.onbeforeunload = function (e) {
        if (sessionStorage) {
            // Save the code to the sessionStorage
            sessionStorage.setItem('code', editor.getCode());
        } else {
            // Show the message
            var msg = i18n.t('confirm-leave');

            e.returnValue = msg;
            return msg;
        }
    };
});

