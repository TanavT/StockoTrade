import { Router } from 'express';
import { userData } from '../data/index.js';
import { verifyLoginRequestBody } from '../utils/auth/user_data.js';
const router = Router();

router
	.route('/')
	.get(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
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
				.render('login', { title: 'Login' });
		}
	})
	.post(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
		if (
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null'
		) {
			return res.status(200).redirect(`../dashboard/${userId}`);
		} else {
			const loginInfo = req.body;
			// Check that request body exists
			if(!loginInfo || Object.keys(loginInfo).length===0){
				return res.status(400).render('error', {
					errorCode: 400,
					title: '400',
					errorMessage: 'Invalid Request Body Detected.',
				});
			}
			// Verify that the request body has what is required (no more no less)
			try {
				verifyLoginRequestBody(loginInfo)
			} catch(e) {
				return res
				.status(400)
				.render('error', {
					errorCode: 400,
					title: '400',
					errorMessage: e,
				});
			}
			// TODO Attempt to login
			try {
				const userName = loginInfo.username_input; 
				const password = loginInfo.password_input; 
				
				// Perform login verification
				// --------------------------
				
				// If successfull, time to set cookies
				const dayFromNow = new Date(
					new Date().getTime() + 60 * 60 * 24 * 1000
				);
				res.cookie('isAuthenticated', 'true', { expires: dayFromNow });
				res.cookie('userID', userInfo._id, { expires: dayFromNow });
				// Then redirect to dashboard
				return res.status(200).redirect(`../dashboard/${userInfo._id}`);
			} catch(e) {
				
			}
		}
	});

export default router;
