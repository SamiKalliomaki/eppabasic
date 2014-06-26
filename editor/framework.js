function submitForm(form, url, callback) {
	data = {}

	$('*', form).filter(':input').each(function() {
		var name = $(this).attr('name');
		var value = $(this).val();

		if(name !== undefined) {
			data[name] = value;
		}
	});

	$.post(url, data, callback)
	.fail(function(xhr, status, error) {
		if(xhr.status === 500) {
			var errorPopup = window.open('');
			errorPopup.document.write('<pre>' + xhr.responseText + '</pre>');
		}
	});
}

function fillFormErrors(form, errors) {
	$('.error-box', form).hide();
	$('.field-error').remove();

	if('__all__' in errors) {
		var text = errors['__all__'].join(' ');

		$('.error-box', form).text(text);
		$('.error-box', form).show();
	}

	for(var name in errors) {
		var field = $('input[name="' + name + '"]', form).parent();

		field.append('<div class="field-error">' + errors[name].join(' ') + '</div>')
	}
}