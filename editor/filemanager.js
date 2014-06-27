var fileDialogCallback;

function openDirectory(dir) {
	$('#current-directory').text('Loading...');
	$('#file-list').empty();

	$.ajax(
		'eb/fs/directory/' + dir + '/',
		{
			success: function(data) {
				var fileList = $('#file-list');
				var currentDirectory = $('#current-directory');

				currentDirectory.empty();

				$('#file-dialog-directory').val(data['id']);

				for(var i in data['parents']) {
					currentDirectory.append('<a href="#" data-dir="' + data['parents'][i].id + '" class="directory-link">' + data['parents'][i].name + '/ </a>');
				}

				for(var i in data['subdirs']) {
					fileList.append('<li><a href="#" data-dir="' + data['subdirs'][i].id + '" class="directory-link">' + data['subdirs'][i].name + '/</a></li>');
				}

				for(var i in data['files']) {
					fileList.append('<li><a href="#" data-file="' + data['files'][i] + '" class="file-link">' + data['files'][i] + '</a></li>');
				}

				if(data['subdirs'].length === 0 && data['files'].length === 0) {
					fileList.append('<li>This directory is empty</li>');
				}
			}
		}
	);
}

$(function() {
	$('#file-dialog-wrapper').hide();

	$('#file-dialog').on('click', '.file-link', function(e) {
		e.preventDefault();

		$('#file-dialog-filename').val($(this).attr('data-file'));
	});

	$('#file-dialog').on('click', '.directory-link', function(e) {
		e.preventDefault();

		openDirectory($(this).attr('data-dir'));
	});

	$('#file-dialog form').on('submit', function(e) {
		e.preventDefault();
		fileDialogCallback(this);
		$('#file-dialog-wrapper').hide();
	});
});

function fileDialog(save, callback) {
	fileDialogCallback = callback;

	openDirectory('root');
	$('#file-dialog-filename').val('');
	$('#file-dialog-wrapper').show();
	$('#file-dialog-submit').val(save ? 'Save' : 'Open');
}

function getFormFile() {
	return { 
        'directory': $('#file-dialog-directory').val(),
        'filename': $('#file-dialog-filename').val()
    };
}

function setFormFile(file) {
	$('#file-dialog-directory').val(file['directory']);
	$('#file-dialog-filename').val(file['filename']);
}