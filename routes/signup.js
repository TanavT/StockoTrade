import { Router } from 'express';
import { userData } from '../data/index.js';
import {
	verifySignUpRequestBody,
	verifyUserInfo,
} from '../utils/auth/user_data.js';
import xss from 'xss';

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
			return res
				.status(200)
				.render('signup', {
					title: 'Sign Up',
					scriptPaths: ['auth_signup_form.js'],
				});
		}
	})
	.post(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		// Theoretically this should never happen but good to check anyway
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
					title: '400 Error',
					errorMessage: 'Invalid Request Body Detected.',
				});
			}
			// Verify that the request body has what is required (no more no less)
			try {
				verifySignUpRequestBody(userInfo);
			} catch (e) {
				return res.status(400).render('error', {
					errorCode: 400,
					title: '400 Error',
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
					xss(userInfo.username_input),
					xss(userInfo.first_name_input),
					xss(userInfo.last_name_input),
					xss(userInfo.email_input),
					xss(userInfo.password_input),
					xss(userInfo.age_input),
					xss(userInfo.birthday_input)
				);
			} catch (e) {
				const errorCode = e[0];
				const errorMessage = `${errorCode} Error: ${e[1]}`;
				return res.status(errorCode).render('signup', {
					title: 'Sign Up',
					errorMessage: errorMessage,
					scriptPaths: ['auth_signup_form.js'],
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
					scriptPaths: ['auth_signup_form.js'],
				});
			}
		}
	});
export default router;
