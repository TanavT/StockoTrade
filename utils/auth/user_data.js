import { ObjectId } from 'mongodb';

export const verifyUserInfo = (
	userName,
	firstName,
	lastName,
	email,
	password,
	age,
	birthday
) => {
	const verifiedUserName = verifyUserName(userName);
	const verifiedFirstName = verifyFirstName(firstName);
	const verifiedLastName = verifyLastName(lastName);
	const verifiedEmail = verifyEmail(email);
	const verifiedPassword = verifyPassword(password);
	const verifiedAge = verifyAge(age);
	const verifiedBirthday = verifyBirthday(birthday);
	return [
		verifiedUserName,
		verifiedFirstName,
		verifiedLastName,
		verifiedEmail,
		verifiedPassword,
		verifiedAge,
		verifiedBirthday,
	];
};

export const verifyUserName = (userName) => {
	const trimUserName = verifyString(userName, 'Username');
	if (trimUserName.length > 32)
		throw [400, 'Username must have a length less than or equal to 32.'];
	const pattern = /^[A-Za-z0-9]+$/;
	if (!pattern.test(trimUserName))
		throw [400, 'Username must only contain letters and numbers.'];
	return trimUserName;
};

export const verifyFirstName = (firstName) => {
	const trimFirstName = verifyString(firstName, 'First Name');
	if (trimFirstName.length > 32)
		throw [400, 'First Name must have a length less than or equal to 32.'];
	const pattern = /^[A-Za-z]+$/;
	if (!pattern.test(trimFirstName))
		throw [400, 'First Name must only contain letters.'];
	return trimFirstName;
};

export const verifyLastName = (lastName) => {
	const trimLastName = verifyString(lastName, 'Last Name');
	if (trimLastName.length > 32)
		throw [400, 'Last Name must have a length less than or equal to 32.'];
	const pattern = /^[A-Za-z]+$/;
	if (!pattern.test(trimLastName))
		throw [400, 'Last Name must only contain letters.'];
	return trimLastName;
};

export const verifyEmail = (email) => {
	const trimEmail = verifyString(email, 'Email');
	const emailPattern = /^[A-Za-z0-9.-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if (!emailPattern.test(trimEmail)) throw [400, 'Invalid email format.'];
	return trimEmail;
};

export const verifyPassword = (password) => {
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

// html will give us age as a string initially
export const verifyAge = (age) => {
	const trimAge = verifyString(age, 'Age');
	const pattern = /^\d+$/;
	if (!pattern.test(trimAge)) throw ['400', 'Age must be a proper number.'];
	const numAge = Number.parseInt(trimAge);
	if (numAge < 18 || numAge > 100)
		throw [400, 'Age must be between 18 and 100.'];
	return trimAge;
};

export const verifyBirthday = (birthday) => {
	const verifyDate = (year, month, day) => {
		const isLeapYear = (year) =>
			(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
		// Ensure month range is atleast from 1 to 12
		if (month < 1 || month > 12) return false;
		// Ensure day range is atleast from 1 to 31
		if (day < 1 || day > 31) return false;
		// Just check 30 day months and Febuary
		if ([4, 6, 9, 11].includes(month)) {
			if (day > 30) return false;
		} else if (month === 2) {
			if (isLeapYear(year) && day > 29) {
				return false;
			} else if (day > 28) {
				return false;
			}
		}
		return true;
	};
	const trimBirthday = verifyString(birthday, 'Birthday');
	if (trimBirthday.length !== 10)
		throw [400, 'Date length must be equal to 10.'];
	const pattern = /^\d{4}\-(0[1-9]|1[0-2])\-(0[1-9]|[12][0-9]|3[01])$/;
	if (!pattern.test(trimBirthday))
		throw [400, 'Birthday must be in YYYY-MM-DD format.'];
	const yearMonthDay = trimBirthday.split('-');
	const year = Number.parseInt(yearMonthDay[0]);
	const month = Number.parseInt(yearMonthDay[1]);
	const day = Number.parseInt(yearMonthDay[2]);
	const today = new Date();
	if (year > today.getFullYear() || year < 1900)
		throw [
			400,
			`Invalid birthday year range, only years [1900,${today.getFullYear()}] is allowed.`,
		];
	if (!verifyDate(year, month, day)) throw [400, 'Invalid Birthday.'];

	const yearDifference = today.getFullYear() - year;
	if (yearDifference < 18)
		throw [400, 'Sorry, but you must be 18 or older to use StockoTrade.'];
	if (yearDifference === 18) {
		const currentMonth = today.getMonth() + 1;
		const currentDay = today.getDate();
		if (
			currentMonth < month ||
			(currentMonth === month && currentDay < day)
		)
			throw [
				400,
				'Sorry, but you must be 18 or older to use StockoTrade.',
			];
	}
	return trimBirthday;
};

// Will be used in dashboard router
export const verifyId = (id) => {
	const trimId = verifyString(id, 'User ID');
	if (!ObjectId.isValid(trimId)) throw [400, 'Invalid object ID.'];
	return trimId;
};

//for buying and selling stock functions, when calling this function you will need to use yahoofinance.search after to make sure the stock exists
export const verifyStockAndUserPartial = (id, stockTicker, volume) => {
	const verifiedId = verifyId(id);
	const verifiedStockTicker = verifyString(
		stockTicker,
		'Stock Ticker'
	).toUpperCase();
	const verifiedVolume = verifyNumber(volume, 'Volume');
	return [verifiedId, verifiedStockTicker, verifiedVolume];
};

//takes string number and output number of type number
export const verifyNumber = (num, varName) => {
	const trimNum = verifyString(num, varName);
	const pattern = /^\d+$/;
	if (!pattern.test(trimNum))
		throw ['400', `${varName} must be a proper number.`];
	const numb = Number.parseInt(trimNum);
	return numb;
};

// These errors wont require an array
export const verifySignUpRequestBody = (requestBody) => {
	if (Object.keys(requestBody).length !== 7)
		throw 'Invalid request body length.';
	if (!checkIfKeyInObject('username_input', requestBody))
		throw 'Need username in request body.';
	if (!checkIfKeyInObject('first_name_input', requestBody))
		throw 'Need first name in request body.';
	if (!checkIfKeyInObject('last_name_input', requestBody))
		throw 'Need last name in request body.';
	if (!checkIfKeyInObject('email_input', requestBody))
		throw 'Need email in request body.';
	if (!checkIfKeyInObject('password_input', requestBody))
		throw 'Need password in request body.';
	if (!checkIfKeyInObject('age_input', requestBody))
		throw 'Need age in request body.';
	if (!checkIfKeyInObject('birthday_input', requestBody))
		throw 'Need birthday in request body.';
};

// These errors wont require an array
export const verifyLoginRequestBody = (requestBody) => {
	if (Object.keys(requestBody).length !== 2)
		throw 'Invalid request body length.';
	if (!checkIfKeyInObject('username_input', requestBody))
		throw 'Need username in request body.';
	if (!checkIfKeyInObject('password_input', requestBody))
		throw 'Need first name in request body.';
};

const checkIfKeyInObject = (keyName, requestBody) => {
	return keyName in requestBody;
};

// These errors DO require an array
export const verifyString = (str, varName) => {
	//gonna export this for now, lmk if it should not be exported
	if (!str) throw [400, `You must provide a ${varName}.`];
	if (typeof str !== 'string') throw [400, `${varName} must be a string.`];
	const trimStr = str.trim();
	if (trimStr.length < 1)
		throw [400, `${varName} cannot be an empty string or whitespace.`];
	return trimStr;
};
