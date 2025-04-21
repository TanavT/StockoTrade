import { Router } from 'express';
import { portfolioData } from '../data/index.js';
const router = Router();

router.route('/').get(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
	const userId = req.cookies.userID; // Make sure we have a userID cookies
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		return res
			.status(200)
			.render('leaderboard', {
				title: 'Leaderboard',
				isLoggedIn: true,
				scriptPaths: ['load_leaderboard.js'], // Client-side JS to load table
			});
	} else {
		return res.status(200).redirect('/');
	}
});

export default router;
