function FileDialogController(fileDialogWrapper, notificationSystem) {
    this.fileDialogWrapper = $(fileDialogWrapper);
    this.fileDialog = $('.file-dialog', fileDialogWrapper);
    this.currentDirectory = $('.current-directory', this.fileDialog);
    this.mainFileList = $('.main-file-list', this.fileDialog);
    this.shareBox = $('.share-box', this.fileDialog);
    this.sharedFileList = $('.shared-file-list', this.fileDialog);
    this.fileForm = $('form', this.fileDialog);
    this.formDirectory = $('input[name="directory"]', this.fileForm);
    this.formFilename = $('input[name="filename"]', this.fileForm);
    this.formSubmit = $('input[type="submit"]', this.fileForm);
    this.createDirectory = $('.create-directory', this.fileDialog);
    this.deleteDirectory = $('.delete-directory', this.fileDialog);
    this.onSelect = function() {}

    var me = this;

    // Event handlers
    this.fileDialogWrapper.click(function(e) {
        if(e.target !== this)
            return;

        me.hide();
    });

    this.fileDialog.on('click', '.file-link', function(e) {
        e.preventDefault();

        me.formFilename.val($(this).data('file'));
    });

    this.fileDialog.on('click', '.directory-link', function(e) {
        e.preventDefault();

        me.openDirectory($(this).data('dir'), $(this).data('parents'));
    });

    this.createDirectory.click(function(e) {
        e.preventDefault();

        var name = window.prompt('Enter name for the new directory.');
        if(name !== null) {
            simplePost('eb/fs/create_directory/', {
                'name': name,
                'directory':  me.formDirectory.val()
            }, function(data) {
                if(data['result'] === 'success') {
                    me.openDirectory(me.openedDirectory, me.openedDirectoryParents);
                } else {
                    notificationSystem.showErrors(data['errors'])
                }
            });
        }
    });

    this.deleteDirectory.click(function(e) {
        e.preventDefault();

        if(confirm('Are you sure you want to delete this directory and everything inside it? This cannot be undone.')) {
            simplePost('eb/fs/delete_directory/', {
                'directory':  me.formDirectory.val()
            }, function(data) {
                if(data['result'] === 'success') {
                    me.openDirectory(me.openedDirectoryParents[me.openedDirectoryParents.length - 1].id, me.openedDirectoryParents.slice(0, -1));
                } else {
                    notificationSystem.showErrors(data['errors'])
                }
            });
        }
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
    show: function(editMode) {
        this.editMode = editMode;

        this.resetDialog();
        this.formSubmit.val(editMode ? 'Save' : 'Open');
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

    openDirectory: function(dir, parents) {
        parents = parents || [];

        this.currentDirectory.text('Loading...');
        this.mainFileList.empty();
        this.sharedFileList.empty();
        this.shareBox.hide();

        var me = this;

        $.ajax(
            'eb/fs/directory/' + dir + '/',
            {
                success: function(data) {
                    me.openedDirectory = data['id'];
                    me.openedDirectoryParents = parents.slice(0);

                    me.currentDirectory.empty();
                    me.formDirectory.val(data['id']);
                    $('input', me.fileForm).prop('disabled', false);

                    if(data['editable']) {
                        me.createDirectory.parent().show();
                    } else {
                        me.createDirectory.parent().hide();

                        if(me.editMode) {
                            $('input', me.fileForm).prop('disabled', true);
                        }
                    }

                    if(data['deletable']) {
                        me.deleteDirectory.parent().show();
                    } else {
                        me.deleteDirectory.parent().hide();
                    }

                    parents.push({ 'id': data['id'], 'name': data['name'] });

                    function populateFileList(fileList, content) {
                        for(var i in content['subdirs']) {
                            var listElem = $('<li/>', {
                                'class': 'directory'
                            });

                            listElem.append($('<a/>', {
                                'href': '#',
                                'class': 'directory-link',
                                'data-dir': content['subdirs'][i].id,
                                'data-parents': JSON.stringify(parents),
                                'text': content['subdirs'][i].name + '/'
                            }));

                            fileList.append(listElem);
                        }

                        for(var i in content['files']) {
                            var listElem = $('<li/>', {
                                'class': 'file'
                            });

                            listElem.append($('<a/>', {
                                'href': '#',
                                'class': 'file-link',
                                'data-file': content['files'][i],
                                'text': content['files'][i]
                            }));

                            fileList.append(listElem);
                        }

                        if(content['subdirs'].length === 0 && content['files'].length === 0) {
                            fileList.append('<li>This directory is empty</li>');
                        }
                    }

                    populateFileList(me.mainFileList, data['content']);

                    if('shared' in data) {
                        me.shareBox.show();
                        populateFileList(me.sharedFileList, data['shared']);
                    } else {
                        me.shareBox.hide();
                    }

                    for(var i in parents) {
                        me.currentDirectory.append($('<a/>', {
                            'href': '#',
                            'class': 'directory-link',
                            'data-dir': parents[i].id,
                            'data-parents': JSON.stringify(parents.slice(0, i)),
                            'text': parents[i].name + '/'
                        }));
                    }
                }
            }
        );
    }
}