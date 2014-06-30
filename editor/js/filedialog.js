function FileDialogController(fileDialogWrapper) {
    this.fileDialogWrapper = $(fileDialogWrapper);
    this.fileDialog = $('.file-dialog', fileDialogWrapper);
    this.currentDirectory = $('.current-directory', this.fileDialog);
    this.fileList = $('.file-list', this.fileDialog);
    this.fileForm = $('form', this.fileDialog);
    this.formDirectory = $('input[name="directory"]', this.fileForm);
    this.formFilename = $('input[name="filename"]', this.fileForm);
    this.formSubmit = $('input[type="submit"]', this.fileForm);
    this.onSelect = function() {}

    var me = this;

    // Event handlers
    this.fileDialog.on('click', '.file-link', function(e) {
        e.preventDefault();

        me.formFilename.val($(this).attr('data-file'));
    });

    this.fileDialog.on('click', '.directory-link', function(e) {
        e.preventDefault();

        me.openDirectory($(this).attr('data-dir'));
    });

    this.fileForm.on('submit', function(e) {
        e.preventDefault();

        if(me.formFilename.val() !== '') {
            me.onSelect();
            me.fileDialogWrapper.hide();
        }
    });

    // Hide the dialog
    this.hide();
}

FileDialogController.prototype = {
    show: function(submitButton) {
        this.resetDialog();
        this.formSubmit.val(submitButton);
        this.fileDialogWrapper.show();
    },

    hide: function() {
        this.fileDialogWrapper.hide();
    },

    getSelectedFile: function() {
        return { 
            'directory': this.formDirectory.val(),
            'filename': this.formFilename.val()
        };
    },

    setSelectedFile: function(file) {
        this.formDirectory.val(file['directory']);
        this.formFilename.val(file['filename']);
        this.openDirectory(file['directory']);
    },

    resetDialog: function() {
        this.openDirectory('root');
        this.formFilename.val('');
    },

    openDirectory: function(dir) {
        this.currentDirectory.text('Loading...');
        this.fileList.empty();

        var me = this;

        $.ajax(
            'eb/fs/directory/' + dir + '/',
            {
                success: function(data) {
                    me.currentDirectory.empty();

                    me.formDirectory.val(data['id']);

                    for(var i in data['parents']) {
                        me.currentDirectory.append('<a href="#" data-dir="' + data['parents'][i].id + '" class="directory-link">' + data['parents'][i].name + '/ </a>');
                    }

                    for(var i in data['subdirs']) {
                        me.fileList.append('<li><a href="#" data-dir="' + data['subdirs'][i].id + '" class="directory-link">' + data['subdirs'][i].name + '/</a></li>');
                    }

                    for(var i in data['files']) {
                        me.fileList.append('<li><a href="#" data-file="' + data['files'][i] + '" class="file-link">' + data['files'][i] + '</a></li>');
                    }

                    if(data['subdirs'].length === 0 && data['files'].length === 0) {
                        me.fileList.append('<li>This directory is empty</li>');
                    }
                }
            }
        );
    }
}