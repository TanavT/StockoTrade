import { Router } from 'express';
const router = Router();

router.route('/').post(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID;
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		const aDayAgo = new Date();
		aDayAgo.setDate(aDayAgo.getDate() - 1);
		res.cookie('isAuthenticated', '', { expires: aDayAgo });
		res.cookie('userID', '', { expires: aDayAgo });
		res.clearCookie('isAuthenticated');
		res.clearCookie('userID');
		return res.status(200).redirect('/');
	} else {
		// The user isn't even logged in, so just go to home
		return res.status(200).redirect('/');
	}
});

export default router;
