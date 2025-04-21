import { Router } from 'express';
import { userData } from '../data/index.js';
import {
	verifySignUpRequestBody,
	verifyUserInfo,
} from '../utils/auth/user_data.js';

const router = Router();

router
	.route('/')
	.get(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if (
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null'
		) {
			return res.status(200).redirect(`../dashboard/${userId}`);
		} else {
			return res.status(200).render('signup', { title: 'Sign Up' });
		}
	})
	.post(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if (
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null'
		) {
			return res.status(200).redirect(`../dashboard/${userId}`);
		} else {
			const userInfo = req.body;
			// Check if a request body exists
			if (!userInfo || Object.keys(userInfo).length === 0) {
				return res.status(400).render('error', {
					errorCode: 400,
					title: '400',
					errorMessage: 'Invalid Request Body Detected.',
				});
			}
			// Verify that the request body has what is required (no more no less)
			try {
				verifySignUpRequestBody(userInfo);
			} catch (e) {
				return res.status(400).render('error', {
					errorCode: 400,
					title: '400',
					errorMessage: e,
				});
			}
			try {
				// Perform input verification server side
				var [
					verifiedUserName,
					verifiedFirstName,
					verifiedLastName,
					verifiedEmail,
					verifiedPassword,
					verifiedAge,
					verifiedBirthday,
				] = verifyUserInfo(
					userInfo.username_input,
					userInfo.first_name_input,
					userInfo.last_name_input,
					userInfo.email_input,
					userInfo.password_input,
					userInfo.age_input,
					userInfo.birthday_input
				);
			} catch (e) {
				console.log(e);
				const errorCode = e[0];
				const errorMessage = `${errorCode} Error: ${e[1]}`;
				return res.status(errorCode).render('signup', {
					title: 'Sign Up',
					errorMessage: errorMessage,
				});
			}
			try {
				const userInsertInfo = await userData.createUser(
					verifiedUserName,
					verifiedFirstName,
					verifiedLastName,
					verifiedEmail,
					verifiedPassword,
					verifiedAge,
					verifiedBirthday
				);
				// If successfull, set cookies
				const dayFromNow = new Date(
					new Date().getTime() + 60 * 60 * 24 * 1000
				);
				res.cookie('isAuthenticated', 'true', { expires: dayFromNow });
				res.cookie('userID', userInsertInfo._id, {
					expires: dayFromNow,
				});
				// Then redirect to dashboard
				return res
					.status(200)
					.redirect(`../dashboard/${userInsertInfo._id}`);
			} catch (e) {
				const errorCode = e[0];
				const errorMessage = `${errorCode} Error: ${e[1]}`;
				return res.status(errorCode).render('signup', {
					title: 'Sign Up',
					errorMessage: errorMessage,
				});
			}
		}
	});
export default router;
