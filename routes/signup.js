import { Router } from 'express';
import { userData } from '../data/index.js';
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
			return res.status(200).redirect(`/dashboard/${userId}`);
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
			return res.status(200).redirect(`/dashboard/${userId}`);
		} else {
			const userName = req.body.username_input // already have valid chars
			const firstName = req.body.first_name_input // we should just toUpperCase() in DB
			const lastName = req.body.last_name_input // we should just toUpperCase() in DB
			const email = req.body.email_input // already in proper format
			const password = req.body.password_input // already in proper format of length 8 (can literally be any char in it)
			const age = req.body.age_input // already in proper format
			const birthday = req.body.birthday_input // already in proper format
			// Check if username isnt taken already or
			// if email is already used by someone else	
			try {
				const user = userData.createUser();
			} catch(e) {

			}
		}
	});

export default router;
