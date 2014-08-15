function FileControlsController(fileControls, editor, userControlsController, fileDialogController, notificationSystem) {
    this.fileControls = $(fileControls);
    this.openedFile = null;

    this.newButton = $('.new', this.fileControls);
    this.loadButton = $('.load', this.fileControls);
    this.saveButton = $('.save', this.fileControls);
    this.saveAsButton = $('.save-as', this.fileControls);

    var me = this;

    userControlsController.onLogin = function() {
        me.fileControls.css('display', 'inline-block');
    };
    userControlsController.onLogout = function() {
        me.fileControls.hide();
    };

    this.newButton.click(function() {
        if(!editor.modified || confirm(i18n.t('editor.confirm-new'))) {
            editor.setCode('');
            editor.modified = false;
            me.openedFile = null;
        }
    });

    this.loadButton.click(function() {
        fileDialogController.show(false);
        fileDialogController.onSelect = function() {
            if(!editor.modified || confirm(i18n.t('editor.confirm-load'))) {
                var fileOpening = fileDialogController.getSelectedFile();

                submitForm(fileDialogController.fileForm, 'eb/fs/open/', function(data) {
                    if(data['result'] === 'success') {
                        editor.setCode(data['content']);
                        editor.modified = false;
                        notificationSystem.notify('File opened successfully.');

                        if(data['editable']) {
                            me.openedFile = fileOpening;
                        } else {
                            me.openedFile = null;
                        }
                    } else {
                        notificationSystem.showErrors(data['errors']);
                    }
                });
            }
        }
    });

    function save() {
        submitForm(
            fileDialogController.fileForm,
            'eb/fs/save/',
            function(data) {
                if(data['result'] === 'success') {
                    notificationSystem.notify('File saved successfully.');
                    editor.modified = false;
                } else {
                    notificationSystem.showErrors(data['errors']);
                }
            },
            { 'content': editor.getCode() }
        );

        me.openedFile = fileDialogController.getSelectedFile();
    }

    this.saveButton.click(function() {
        if(me.openedFile == null) {
            fileDialogController.show(true);
            fileDialogController.onSelect = save;
        } else {
            fileDialogController.setSelectedFile(me.openedFile);
            save();
        }
    });

    this.saveAsButton.click(function() {
        fileDialogController.show('Save');
        fileDialogController.onSelect = save;
    });
}