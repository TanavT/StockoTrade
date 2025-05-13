// Client side javascript to client-side verify form info for login
const loginForm = document.getElementById('login-form');
const userNameInput = document.getElementById('username_input');
const passwordInput = document.getElementById('password_input');
const loginErrorOutput = document.getElementById('login-error');
if (loginForm) {
	function outputError(errorcode, message) {
		userNameInput.value = '';
		passwordInput.value = '';
		loginErrorOutput.innerHTML = `${errorcode}: ${message}`;
		loginErrorOutput.hidden = false;
	}
	loginForm.addEventListener('submit', (event) => {
		event.preventDefault();
		try {
			verifyUserName(userNameInput.value);
			verifyPassword(passwordInput.value);
			loginErrorOutput.hidden = true;
			loginForm.submit();
		} catch (e) {
			outputError(e[0], e[1]);
		}
	});
}

const verifyUserName = (userName) => {
	const trimUserName = verifyString(userName, 'Username');
	if (trimUserName.length > 32)
		throw [400, 'Username must have a length less than or equal to 32.'];
	const pattern = /^[A-Za-z0-9]+$/;
	if (!pattern.test(trimUserName))
		throw [400, 'Username must only contain letters and numbers.'];
	return trimUserName;
};

const verifyPassword = (password) => {
	const trimPassword = verifyString(password, 'Password');
	if (trimPassword.length < 8)
		throw [400, 'Password length must be greater than or equal to 8.'];
	const pattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])[\S]{8,}$/;
	if (!pattern.test(trimPassword))
		throw [
			400,
			'Password must contain at least one uppercase, number, and special character.',
		];
	return trimPassword;
};

const verifyString = (str, varName) => {
	if (!str) throw [400, `You must provide a ${varName}.`];
	if (typeof str !== 'string') throw [400, `${varName} must be a string.`];
	const trimStr = str.trim();
	if (trimStr.length < 1)
		throw [400, `${varName} cannot be an empty string or whitespace.`];
	return trimStr;
};
