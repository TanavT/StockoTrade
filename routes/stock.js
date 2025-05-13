import { Router } from 'express';
import { portfolioData, stockData, userData } from '../data/index.js';
import xss from 'xss';
const router = Router();
import { verifyString } from '../utils/auth/user_data.js';

router.get('/', async (req, res) => {
	let ticker = null;
	if (req.query.ticker) {
		const checkTicker = xss(req.query.ticker.trim());
		ticker = checkTicker.toUpperCase();
	}

	try {
		const isLoggedIn = req.cookies.isAuthenticated;
		const userId = req.cookies.userID;
		if (!ticker) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		const validated = await stockData.validateStockTicker(ticker);
		if (!validated) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		let data = await stockData.getStockData(ticker);

		if (!data) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		const user = await userData.getUserById(userId);
		let userCapital = user.portfolio_information.capital;
		let userSharesOwned = 0;
		if (ticker in user.portfolio_information.tickers) {
			userSharesOwned = user.portfolio_information.tickers[ticker].volume;
		}
		let userAbleToBuy = Math.floor(userCapital / data.currentPriceNUMBER);

		if (
			data.chartLabels === null ||
			data.chartPrices === null ||
			data.chartLabels === undefined ||
			data.chartPrices === undefined
		) {
			res.status(200).render('stock', {
				title: `${data.companyName} (${ticker})`,
				isLoggedIn: isLoggedIn,
				tickerSymbol: ticker,
				chartLabels: JSON.stringify(data.chartLabels),
				chartPrices: JSON.stringify(data.chartPrices),
				currentPrice: data.currentPrice,
				isPositive: data.isPositive,
				priceChange: data.priceChange,
				percentChange: data.percentChange,
				openPrice: data.openPrice,
				previousClose: data.previousClose,
				dayHigh: data.dayHigh,
				dayLow: data.dayLow,
				volume: data.volume,
				marketCap: data.marketCap,
				marketCapAbbrev: data.marketCapAbbrev,
				companyName: data.companyName,
				companySummary: data.summary,
				graphTrue: false,
				userCapital: userCapital,
				userSharesOwned: userSharesOwned,
				userAbleToBuy: userAbleToBuy,
			});
		} else {
			res.status(200).render('stock', {
				title: `${data.companyName} (${ticker})`,
				scriptPaths: ['stockpages.js'],
				outsidePaths: [
					'https://cdn.jsdelivr.net/npm/chart.js',
					'https://cdn.jsdelivr.net/npm/moment',
					'https://cdn.jsdelivr.net/npm/chartjs-adapter-moment',
				],
				isLoggedIn: isLoggedIn,
				tickerSymbol: ticker,
				chartLabels: JSON.stringify(data.chartLabels),
				chartPrices: JSON.stringify(data.chartPrices),
				currentPrice: data.currentPrice,
				isPositive: data.isPositive,
				priceChange: data.priceChange,
				percentChange: data.percentChange,
				openPrice: data.openPrice,
				previousClose: data.previousClose,
				dayHigh: data.dayHigh,
				dayLow: data.dayLow,
				volume: data.volume,
				marketCap: data.marketCap,
				marketCapAbbrev: data.marketCapAbbrev,
				companyName: data.companyName,
				companySummary: data.summary,
				graphTrue: true,
				userCapital: userCapital,
				userSharesOwned: userSharesOwned,
				userAbleToBuy: userAbleToBuy,
			});
		}
	} catch (e) {
		res.status(500).render('error', {
			errorCode: '500',
			errorMessage: `Stock with ticker ${ticker} not found`,
		});
	}
});

router.get('/chart/:ticker', async (req, res) => {
	let ticker = null;
	if (req.params.ticker) {
		const checkTicker = xss(req.params.ticker.trim());
		ticker = checkTicker.toUpperCase();
	}

	try {
		let data = await stockData.getStockData(ticker);

		const validated = await stockData.validateStockTicker(ticker);
		if (!validated) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		if (!data) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		res.json({
			chartLabels: data.chartLabels,
			chartPrices: data.chartPrices,
		});
	} catch (e) {
		res.status(500).render('error', {
			errorCode: '500',
			errorMessage: `Stock with ticker ${ticker} not found`,
		});
	}
});

router.route('/:stockTicker').get(async (req, res) => {
	try {
		req.params.stockTicker = verifyString(
			req.params.stockTicker,
			'stockTicker'
		);
	} catch (e) {
		const errorCode = e[0];
		return res.status(errorCode).render('error', {
			errorCode: errorCode,
			title: `${errorCode} Error`,
			errorMessage: e[1],
		});
	}
	return res
		.status(200)
		.render('stock', {
			isLoggedIn: true,
			title: req.params.stockTicker,
			scriptPaths: ['searchBar.js'],
		});
});

export default router;
