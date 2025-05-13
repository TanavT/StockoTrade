import { Router } from 'express';
import { portfolioData, stockData, userData } from '../data/index.js';
import xss from 'xss';
const router = Router();

let roundingVal = 2;

router.get('/', async (req, res) => {
	let ticker = null;
	if (req.query.ticker) {
		const checkTicker = xss(req.query.ticker.trim());
		ticker = checkTicker.toUpperCase();
	}

	try {
		let isLoggedIn = req.cookies.isAuthenticated;
		if (isLoggedIn === 'true') {
			isLoggedIn = true;
		} else {
			isLoggedIn = false;
		}
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

		let data = null;
		try {
			data = await stockData.getStockData(ticker);

			if (!data) {
				return res.status(404).render('error', {
					errorCode: '404',
					errorMessage: `Stock with ticker ${ticker} not found`,
				});
			}
		} catch (e) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		if (isLoggedIn) {
			const user = await userData.getUserById(userId);
			let userCapital =
				user.portfolio_information.capital.toFixed(roundingVal);
			let userSharesOwned = 0;
			for (let obj of user.portfolio_information.tickers) {
				if (obj.stock_ticker === ticker.toString()) {
					userSharesOwned = obj.volume;
				}
			}
			let userAbleToBuy = Math.floor(
				userCapital / data.currentPriceNUMBER
			);
			if (userAbleToBuy !== 0) {
				userAbleToBuy -= 1;
			}
			let valueSharesOwned = (
				userSharesOwned * data.currentPriceNUMBER
			).toFixed(roundingVal);

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
					valueSharesOwned: valueSharesOwned,
					isSubscribed: user.isSubscribed,
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
					valueSharesOwned: valueSharesOwned,
					isSubscribed: user.isSubscribed,
				});
			}
		} else {
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
				});
			}
		}
	} catch (e) {
		res.status(500).render('error', {
			errorCode: '500',
			errorMessage: e,
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

		return res.json({
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

router.route('/buy/:ticker').post(async (req, res) => {
	const userId = req.cookies.userID;
	const isLoggedIn = req.cookies.isAuthenticated;

	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		let ticker = null;
		const checkTicker = xss(req.params.ticker.trim());
		ticker = checkTicker.toUpperCase();

		let quantity = req.body.quantityBuy;
		const checkQuantity = xss(req.body.quantityBuy.trim());
		quantity = checkQuantity;
		try {
			Number.parseInt(req.body.quantityBuy);
		} catch (e) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Number of shares purchased must be a positive integer`,
			});
		}

		let data = null;
		try {
			data = await stockData.getStockData(ticker);
			if (!data) {
				return res.status(404).render('error', {
					errorCode: '404',
					errorMessage: `Stock with ticker ${ticker} not found`,
				});
			}
		} catch (e) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		try {
			await userData.getUserById(userId);
			await portfolioData.buyStock(userId, ticker, quantity);
		} catch (e) {
			const errorCode = e[0];
			return res.status(errorCode).render('error', {
				errorCode: errorCode,
				title: `${errorCode} Error`,
				errorMessage: e[1],
			});
		}
		return res.redirect(`/stock?ticker=${ticker}`);
	} else {
		return res.status(404).render('error', {
			errorCode: '404',
			errorMessage: `Must be logged in to purchase a stock`,
		});
	}
});

router.route('/sell/:ticker').post(async (req, res) => {
	const userId = req.cookies.userID;
	const isLoggedIn = req.cookies.isAuthenticated;
	if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
		let ticker = null;
		const checkTicker = xss(req.params.ticker.trim());
		ticker = checkTicker.toUpperCase();

		let quantity = req.body.quantitySell;
		const checkQuantity = xss(req.body.quantitySell.trim());
		quantity = checkQuantity;
		try {
			Number.parseInt(req.body.quantitySell);
		} catch (e) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Number of shares sold must be a positive integer`,
			});
		}

		let data = null;
		try {
			data = await stockData.getStockData(ticker);
			if (!data) {
				return res.status(404).render('error', {
					errorCode: '404',
					errorMessage: `Stock with ticker ${ticker} not found`,
				});
			}
		} catch (e) {
			return res.status(404).render('error', {
				errorCode: '404',
				errorMessage: `Stock with ticker ${ticker} not found`,
			});
		}

		try {
			await userData.getUserById(userId);
			await portfolioData.sellStock(userId, ticker, quantity);
		} catch (e) {
			const errorCode = e[0];
			return res.status(errorCode).render('error', {
				errorCode: errorCode,
				title: `${errorCode} Error`,
				errorMessage: e[1],
			});
		}
		return res.redirect(`/stock?ticker=${ticker}`);
	} else {
		return res.status(404).render('error', {
			errorCode: '404',
			errorMessage: `Must be logged in to purchase a stock`,
		});
	}
});

export default router;
