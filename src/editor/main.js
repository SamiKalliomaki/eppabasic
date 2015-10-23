define(['jquery', 'i18n', './notifications', './manual', './editor', './usercontrols', './filedialog', './filecontrols', './codecontrols', './pastecontrols', './themecontrols', 'jqueryui'], function ($, i18n, NotificationSystem, Manual, Editor, UserControlsController, FileDialogController, FileControlsController, CodeControlsController, PasteControlsController, ThemeControlsController) {
    $(function () {
        function getManualLang() {
            if(i18n.options.lng) {
                return i18n.options.lng.substr(0, 2);
            } else {
                return 'en';
            }
        }

        var notificationSystem = new NotificationSystem('#notification-box');
        var manual = new Manual('#manual-container', 'en');
        var editor = new Editor('editor', manual);
        var userControlsController = new UserControlsController('#user-controls');
        var fileDialogController = new FileDialogController('#file-dialog-wrapper', notificationSystem);
        var fileControlsController = new FileControlsController('#file-controls', editor, userControlsController, fileDialogController, notificationSystem);
        var codeControlsController = new CodeControlsController('#code-controls', editor);
        var pasteControlsController = new PasteControlsController('#paste-controls', '#share-dialog-wrapper', editor, notificationSystem);
        var themeControlsController = new ThemeControlsController('#logo');

        manual.openPage('index');

        window.ebeditor = editor;

        i18n.init({
            cookieName: 'lang',
            fallbackLng: 'en-US'
        }, function (t) {
            $('#language-selection').val(i18n.options.lng);

            $('#language-selection').change(function () {
                i18n.setLng($('#language-selection').val(), function (t) {
                    $('body').i18n();
                    manual.setLang(getManualLang());
                });
            });

            $('body').i18n();
            manual.setLang(getManualLang());
        });

        $('#editor').resizable({
            resize: function (e, ui) {
                $('#manual-container').css('margin-left', ui.size.width + 2);
            },
            handles: "e"
        });

        $('.dialog-wrapper').click(function (e) {
            if (e.target !== this)
                return;

            $(this).hide();
        });

        function tryLoadFromStorage(storage) {
            if (storage && storage.getItem('code')) {
                editor.setCode(storage.getItem('code'));
                editor.modified = storage.getItem('code-modified') === 'true';
            }
        }

        function trySaveToStorage(storage) {
            if (storage) {
                storage.setItem('code', editor.getCode());
                storage.setItem('code-modified', editor.modified);
            }
        }

        // Restore save code
        tryLoadFromStorage(localStorage);
        tryLoadFromStorage(sessionStorage);

        // Save code to sessionStorage if possible
        // Otherwise just show a message telling that the code will be lost
        window.onbeforeunload = function (e) {
            if (sessionStorage || localStorage) {
                // Save the code to the Storage
                trySaveToStorage(localStorage);
                trySaveToStorage(sessionStorage);
            } else if (editor.modified) {
                // Show the message
                var msg = i18n.t('editor.confirm-leave');

                e.returnValue = msg;
                return msg;
            }
        };
    });
});
