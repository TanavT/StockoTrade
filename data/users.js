import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { users } from '../config/mongodb/mongoCollections.js';
import {
	verifyId,
	verifyUserInfo,
	verifyUserName,
	verifyPassword,
} from '../utils/auth/user_data.js';

const createUser = async (
	userName,
	firstName,
	lastName,
	email,
	password,
	age,
	birthday
) => {
	// Perform data-side input verification
	const [
		verifiedUserName,
		verifiedFirstName,
		verifiedLastName,
		verifiedEmail,
		verifiedPassword,
		verifiedAge,
		verifiedBirthday,
	] = verifyUserInfo(
		userName,
		firstName,
		lastName,
		email,
		password,
		age,
		birthday
	);

	const userCollection = await users();

	// Verify that username or email hasn't been taken yet
	const tryToFindUser = await userCollection.findOne({
		username: verifiedUserName.toUpperCase(),
	});
	if (tryToFindUser) throw [409, 'Username already taken.'];
	const tryToFindEmail = await userCollection.findOne({
		email: verifiedEmail.toUpperCase(),
	});
	if (tryToFindEmail) throw [409, 'Email already taken.'];

	// Hash passwords
	const salt = bcrypt.genSaltSync(10);
	const passwordHash = bcrypt.hashSync(verifiedPassword, salt);

	const newUser = {
		username: verifiedUserName.toUpperCase(),
		filler_username: verifiedUserName, // Filler value for visual purposes
		password: passwordHash,
		firstName: verifiedFirstName,
		lastName: verifiedLastName,
		email: verifiedEmail.toUpperCase(),
		birthday: verifiedBirthday,
		age: Number.parseInt(verifiedAge),
		portfolio_information: {
			capital: 100000,
			portfolio_worth: 100000,
			tickers: [],
			trade_history: [],
		},
		isSubscribed: false,
	};
	const insertInfo = await userCollection.insertOne(newUser);
	if (!insertInfo.acknowledged || !insertInfo.insertedId) {
		throw [500, 'Could not sign-up new user, try again later.'];
	}
	const newId = insertInfo.insertedId.toString();
	const user = await getUserById(newId);
	return user;
};

const getUserById = async (userId) => {
	const trimId = verifyId(userId);
	const userCollection = await users();
	const userToFind = await userCollection.findOne({
		_id: new ObjectId(trimId),
	});
	if (userToFind === null) throw [404, 'No user found with that ID.'];
	userToFind._id = userToFind._id.toString();
	return userToFind;
};

const getUserByUserName = async (userName) => {
	const trimUserName = verifyUserName(userName);
	const userCollection = await users();
	const userToFind = await userCollection.findOne({
		username: trimUserName.toUpperCase(),
	});
	if (userToFind === null) throw [404, 'No user found with that username.'];
	userToFind._id = userToFind._id.toString();
	return userToFind;
};

const matchUserNameAndPassword = async (username, password) => {
	const user = await getUserByUserName(username);
	const verifiedPassword = verifyPassword(password);
	const verifyCredentials = bcrypt.compareSync(
		verifiedPassword,
		user.password
	);
	return verifyCredentials;
};

const userDataFunctions = {
	createUser,
	getUserById,
	matchUserNameAndPassword,
	getUserByUserName,
};

export default userDataFunctions;
