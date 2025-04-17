import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { users } from '../config/mongodb/mongoCollections.js';
import { verifyId, verifyUserInfo } from '../utils/auth/user_data.js';

const createUser = async (
	userName,
	firstName,
	lastName,
	email,
	password,
	age,
	birthday
) => {
	const [
		verifiedUserName,
		verifiedFirstName,
		verifiedLastName,
		verifiedEmail,
		verifiedPassword,
		verifiedAge,
		verifiedBirthday
	] = verifyUserInfo(
		userName,
		firstName,
		lastName,
		email,
		password,
		age,
		birthday
	)

	// Verify that username and email hasn't already been used
	
	
	const newUser = {
		username: verifiedUserName.toUpperCase(),
		password: verifiedPassword,
		firstName: verifiedFirstName,
		lastName: verifiedLastName,
		email: verifiedEmail.toUpperCase(),
		birthday: verifiedBirthday,
		age: Number.parseInt(verifiedAge),
		portfolio_information: {
			capital: 100000,
			portfolio_worth: 0,
			tickers: [],
			trade_history: [],
		},
	};
	const userCollection = await users();
	const insertInfo = await userCollection.insertOne(newUser);
	if (!insertInfo.acknowledged || !insertInfo.insertedId) {
		throw ['500','Could not sign-up new user, try again later.'];
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
	if (userToFind === null) throw ['404','No user found with that ID.'];
	userToFind._id = userToFind._id.toString();
	return userToFind;
};

const userDataFunctions = { createUser, getUserById };

export default userDataFunctions;
