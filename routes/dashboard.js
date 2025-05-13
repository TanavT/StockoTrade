import xss from 'xss';
import { Router } from 'express';
import { userData, portfolioData } from '../data/index.js';
import { verifyId, verifyString } from '../utils/auth/user_data.js';
const router = Router();

router.route('/:id').get(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID;
	try {
		req.params.id = verifyId(req.params.id);
	} catch (e) {
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
	if (req.params.id !== userId) {
		return res.status(404).render('error', {
			errorCode: 404,
			title: '404 Error',
			errorMessage: 'Unauthorized account access attempt.',
		});
	}

	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		// The dashboard (by the end of the project) will take in alot of parameters of
		// statistics calculated in realtime
		const user = await userData.getUserById(req.params.id);
		return res
			.status(200)
			.render('dashboard', {
				isLoggedIn: true,
				username: user.filler_username,
				scriptPaths: ['dashboard.js', 'reset_button.js', 'searchBar.js'],
				outsidePaths: ['https://d3js.org/d3.v7.min.js'],
				title: 'dashboard',
				capital: user.portfolio_information.capital.toFixed(4),
				portfolio_worth:
					user.portfolio_information.portfolio_worth.toFixed(4),
				tickers: user.portfolio_information.tickers,
				trade_history: user.portfolio_information.trade_history,
				userId: req.params.id.toString(),
			});
	} else {
		return res.status(200).redirect('/');
	}
});
router.route('/chart/:id').get(async (req, res) => {
	//console.log("Route reached")
	try {
		req.params.id = verifyId(req.params.id);
		const result = await portfolioData.getPortfolioWorthOverTime(req.params.id);
		res.json(result);
	} catch (e) {
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}	
});

router.route('/getValue/:stock_ticker/:volume').get(async (req, res) => {
	//console.log("Route reached")
	let stock_ticker = xss(req.params.stock_ticker);
	let volume = xss(req.params.volume)
	try {
		stock_ticker = verifyString(stock_ticker);
		volume = verifyString(volume);
		const value = await portfolioData.getCurrentValue(stock_ticker, volume);
		res.json(value);
	} catch (e) {
		console.log(e)
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: parseInt(errorCode),
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}	
	// console.log(result)

});


router.route('/worth').post(async (req, res) => {
	//console.log("Route reached")
	let userId = xss(req.body.userId);
	try {
		userId = verifyId(userId);
		const result = await portfolioData.getPortfolioWorthCurrent(userId);
		res.json(result);
	} catch (e) {
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
});


router.route('/sell').post(async (req, res) => {
	//console.log("Route reached")
	let sellAmount = xss(req.body.sellAmount);
	let stockTicker = xss(req.body.stockTicker)
	let userId = xss(req.body.userId);
	try {
		userId = verifyId(userId);
		sellAmount = verifyString(sellAmount);
		stockTicker = verifyString(stockTicker);
		const result = await portfolioData.sellStock(userId, stockTicker, sellAmount);
		res.json(result);
	} catch (e) {
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
});

router.route('/reset').post(async (req,res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID;
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		await portfolioData.resetPortfolio(userId)
		return res.status(200).redirect(`/dashboard/${userId}`)
	} else {
		return res.status(200).redirect('/');
	}
})


export default router;
