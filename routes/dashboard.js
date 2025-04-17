import { Router } from 'express';
import {userData, portfolioData} from '../data/index.js'; 
const router = Router();

router
	.route('/:id')
	.get(async (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; 
		const userId = req.cookies.userID; 
		if (
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null'  &&
			req.params.id === userId
		) {
            // The dashboard (by the end of the project) will take in alot of parameters of 
            // statistics calculated in realtime
			return res.status(200).render('dashboard', {inputScript: true, scriptPaths: [{path: dashboard}], id: userId});
		} else {
			return res
				.status(200)
				.render('home', { title: 'Home' });
		}
	})

export default router;