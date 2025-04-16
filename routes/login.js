import { Router } from 'express';
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
			return res.status(200).render('login', { title: 'Login' });
		}
	})
	.post(async (req, res) => {
		const userName = req.body.username_input
        const password = req.body.password_input

	});

export default router;
