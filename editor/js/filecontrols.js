function FileControlsController(fileControls, editor, userControlsController, fileDialogController) {
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
        editor.setCode('');
        me.openedFile = null;
    });

    this.loadButton.click(function() {
        fileDialogController.show('Open');
        fileDialogController.onSelect = function() {
            submitForm(fileDialogController.fileForm, 'eb/fs/open/', function(data) {
                editor.setCode(data['content']);
            });

            me.openedFile = fileDialogController.getSelectedFile();
        }
    });

    function save() {
        submitForm(
            fileDialogController.fileForm,
            'eb/fs/save/',
            function(data) {
                // TODO Display some message
            },
            { 'content': editor.getCode() }
        );

        openedFile = fileDialogController.getSelectedFile();
    }

    this.saveButton.click(function() {
        if(me.openedFile == null) {
            fileDialogController.show('Save');
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