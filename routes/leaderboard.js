import { Router } from 'express';
import { portfolioData } from '../data/index.js';
const router = Router();

router.route('/').get(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID; 
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		return res
			.status(200)
			.render('leaderboard', {
				title: 'Leaderboard',
				scriptPaths: ['load_leaderboard.js'], // Client-side JS to load table
				outsidePaths: ['https://code.jquery.com/jquery-3.7.1.min.js'],
				isLoggedIn: true,
			});
	} else {
		return res.status(200).redirect('/'); // If a user is not auth'd they cannot access the leaderboard!
	}
});

router.route('/json').get(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID; 
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		const topUsers = await portfolioData.getTopPortfolioProfiles();
		return res.status(200).json(topUsers)
	} else {
		return res.status(200).redirect('/'); // If a user is not auth'd they cannot access the leaderboard data!
	}
});

export default router;
