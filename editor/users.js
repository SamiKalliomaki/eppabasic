window.addEventListener('load', function() {
	document.getElementById('login-link').addEventListener('click', function(e) {
		e.preventDefault();

		var loginBox = document.getElementById('login-box');

		document.getElementById('login-form').style.display = 'block';
		document.getElementById('register-form').style.display = 'none';

		if(loginBox.style.height != '160px') {
			loginBox.style.height = '160px';
		}
		else {
			loginBox.style.height = '0px';
		}
	});

	document.getElementById('register-link').addEventListener('click', function(e) {
		e.preventDefault();

		document.getElementById('login-form').style.display = 'none';
		document.getElementById('register-form').style.display = 'block';
		document.getElementById('login-box').style.height = '260px';
	});

	document.getElementById('login-form').addEventListener('submit', function(e) {
		e.preventDefault();

		// TODO Make AJAX calls
	});

	document.getElementById('register-form').addEventListener('submit', function(e) {
		e.preventDefault();

		// TODO Make AJAX calls
	});
});