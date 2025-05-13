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

	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		if (req.params.id !== userId) {
			return res.status(404).render('error', {
				errorCode: 404,
				title: '404 Error',
				errorMessage: 'Unauthorized account access attempt.',
			});
		}
		// The dashboard (by the end of the project) will take in alot of parameters of
		// statistics calculated in realtime
		const user = await userData.getUserById(req.params.id);
		return res.status(200).render('dashboard', {
			isLoggedIn: true,
			username: user.filler_username,
			scriptPaths: ['dashboard.js', 'reset_button.js'],
			outsidePaths: [
				' https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js',
				'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns',
			],
			title: 'dashboard',
			capital: user.portfolio_information.capital.toFixed(4),
			portfolio_worth:
				user.portfolio_information.portfolio_worth.toFixed(4),
			tickers: user.portfolio_information.tickers,
			trade_history: user.portfolio_information.trade_history,
			userId: req.params.id.toString(),
			isSubscribed: user.isSubscribed
		});
	} else {
		return res.status(200).redirect('/');
	}
});

router.route('/chart/portfolio/:id').get(async (req, res) => {
	try {
		req.params.id = verifyId(req.params.id);
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if(!isLoggedIn && userId != req.params.id) {
			return res.status(404).render('error', {
					errorCode: 404,
					title: '404 Error',
					errorMessage: 'Unauthorized account access attempt.',
				})
		}
		const result = await portfolioData.getPortfolioWorthOverTime(
			req.params.id
		);
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

router.route('/chart/stocks/:id').get(async (req, res) => {
	try {
		req.params.id = verifyId(req.params.id);
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if(!isLoggedIn && userId != req.params.id) {
			return res.status(404).render('error', {
					errorCode: 404,
					title: '404 Error',
					errorMessage: 'Unauthorized account access attempt.',
				})
		}
		const result = await portfolioData.getStockTickers(req.params.id);
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

router.route('/chart/gains/:id').get(async (req, res) => {
	try {
		req.params.id = verifyId(req.params.id);
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if(!isLoggedIn && userId != req.params.id) {
			return res.status(404).render('error', {
					errorCode: 404,
					title: '404 Error',
					errorMessage: 'Unauthorized account access attempt.',
				})
		}
		const result = await portfolioData.getCumulativeGains(req.params.id);
		res.json(result);
	} catch (e) {
		console.log(e);
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
});

router.route('/chart/volatility/:id').get(async (req, res) => {
	try {
		req.params.id = verifyId(req.params.id);
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if(!isLoggedIn && userId != req.params.id) {
			return res.status(404).render('error', {
					errorCode: 404,
					title: '404 Error',
					errorMessage: 'Unauthorized account access attempt.',
				})
		}
		const result = await portfolioData.getVolatilityOverTime(req.params.id);
		res.json(result);
	} catch (e) {
		console.log(e);
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
});

router.route('/getValue/:stock_ticker/:volume').get(async (req, res) => {
	let stock_ticker = xss(req.params.stock_ticker);
	let volume = xss(req.params.volume);
	try {
		stock_ticker = verifyString(stock_ticker);
		volume = verifyString(volume);
		const value = await portfolioData.getCurrentValue(stock_ticker, volume);
		res.json(value);
	} catch (e) {
		console.log(e);
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: parseInt(errorCode),
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
});

router.route('/worth').post(async (req, res) => {
	try {
		let userId = xss(req.body.userId);	
		userId = verifyId(userId);
		const isLoggedIn = req.cookies.isAuthenticated;
		const userIdC = req.cookies.userID;
		if(!isLoggedIn && userId != userIdC) {
			return res.status(404).render('error', {
					errorCode: 404,
					title: '404 Error',
					errorMessage: 'Unauthorized account access attempt.',
				})
		}
		const result = await portfolioData.getPortfolioWorthCurrent(userId);
		return res.json(result);
	} catch (e) {
			console.log(e)

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
	const isLoggedIn = xss(req.cookies.isAuthenticated);
	const cookiesUserId = xss(req.cookies.userID);
	let sellAmount = xss(req.body.sellAmount);
	let stockTicker = xss(req.body.stockTicker);
	let userId = xss(req.body.userId);
	if (
		!(
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null' &&
			cookiesUserId == userId
		)
	) {
		return res.status(404).render('error', {
			errorCode: 404,
			title: '404 Error',
			errorMessage: 'Unauthorized account sell attempt.',
		});
	}
	try {
		userId = verifyId(userId);
		sellAmount = verifyString(sellAmount);
		stockTicker = verifyString(stockTicker);
		const result = await portfolioData.sellStock(
			userId,
			stockTicker,
			sellAmount
		);
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

router.route('/reset').post(async (req, res) => {
	const isLoggedIn = req.cookies.isAuthenticated;
	const userId = req.cookies.userID;
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		await portfolioData.resetPortfolio(userId);
		return res.status(200).redirect(`/dashboard/${userId}`);
	} else {
		return res.status(200).redirect('/');
	}
});

export default router;
