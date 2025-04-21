import { Router } from 'express';
import { userData, portfolioData } from '../data/index.js';
const router = Router();

router.route('/:id').get(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID;
	if (req.params.id !== userId) {
		return res.status(404).render('error', {
			errorCode: 404,
			title: '404',
			errorMessage: 'Unauthorized account access attempt.',
		});
	}

	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		// The dashboard (by the end of the project) will take in alot of parameters of
		// statistics calculated in realtime
		return res.status(200).render('dashboard', { isLoggedIn: true });
	} else {
		return res.status(200).redirect('/');
	}
});

export default router;
