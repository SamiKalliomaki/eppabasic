$(function() {
	function freezeFields(form) {
		$(':input', form).attr('disabled', true);
	}

	function unfreezeFields(form) {
		$(':input', form).attr('disabled', false);
	}
	
	function clearLoginBox() {
		var loginBox = $('#login-box');
		loginBox.slideUp(function() {
			$('form', loginBox).each(function() {
				this.reset();
				unfreezeFields(this);
			});
			$('.error-box', loginBox).hide();
		});
	}

	function setLoggedIn(username) {
		clearLoginBox();

		var userControls = $('#user-controls');

		$('#loading-controls').show();

		userControls.removeClass('logged-out');
		userControls.removeClass('pending');

		userControls.addClass('logged-in');
		$('#current-user').text(username);
	}

	function setLoggedOut() {
		clearLoginBox();

		var userControls = $('#user-controls');

		$('#loading-controls').hide();

		userControls.removeClass('logged-in');
		userControls.removeClass('pending');

		userControls.addClass('logged-out');
	}

	function setPending() {
		clearLoginBox();

		var userControls = $('#user-controls');

		$('#loading-controls').hide();

		userControls.removeClass('logged-in');
		userControls.removeClass('logged-out');

		userControls.addClass('pending');
	}

	$('#login-box').hide();
	$('#register-form').hide();
	$('#loading-controls').hide();
	clearLoginBox();

	$.ajax(
		'eb/user/get/',
		{
			success: function(data) {
				if(data['authenticated']) {
					setLoggedIn(data['username']);
				}
				else {
					setLoggedOut();
				}
			}
		}
	)

	$('#login-link').on('click', function(e) {
		e.preventDefault();

		$('#login-box').slideToggle();
	});

	$('#logout-link').on('click', function(e) {
		e.preventDefault();
		
		setPending();
		$.post(
			'eb/user/logout/',
			'',
			function(data) {
				setLoggedOut();
			}
		);
	});

	$('#register-link').on('click', function(e) {
		e.preventDefault();

		$('#login-form').hide();
		$('#register-form').show();
	});

	$('#already-registered-link').on('click', function(e) {
		e.preventDefault();

		$('#login-form').show();
		$('#register-form').hide();
	});

	$('#login-form').on('submit', function(e) {
		e.preventDefault();

		var form = $('#login-form');

		freezeFields(form);
		submitForm(form, 'eb/user/login/', function(data) {
			if(data['result'] === 'success') {
				setLoggedIn(data['username']);
			} else {
				fillFormErrors(form, data['errors']);
				unfreezeFields(form);
			}
		});
	});

	$('#register-form').on('submit', function(e) {
		e.preventDefault();

		var form = $('#register-form');

		freezeFields(form);
		submitForm(form, 'eb/user/register/', function(data) {
			if(data['result'] === 'success') {
				setLoggedIn(data['username']);
			} else {
				fillFormErrors(form, data['errors']);
				unfreezeFields(form);
			}
		});
	});
});