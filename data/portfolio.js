import yahooFinance from 'yahoo-finance2';
yahooFinance.suppressNotices(['yahooSurvey']); //I gave you your survey, stop sending this message :(

import { ObjectId } from 'mongodb';
import { users } from '../config/mongodb/mongoCollections.js';
import {
	verifyStockAndUserPartial,
	verifyId,
	verifyString,
} from '../utils/auth/user_data.js';
import { userData } from './index.js';

/**volume must be inputted as a string
 * THIS VARIENT IS ONLY INTENDED FOR USE IN SEEDING DATABASE, WILL NOT BE USED BY USERS
 */
const buyStockPast = async (userId, stock_ticker, volume, dateBought) => {
	const [verifiedUserId, verifiedStock_Ticker, verifiedVolume] =
		verifyStockAndUserPartial(userId, stock_ticker, volume);
	const userCollection = await users();
	const userToBuy = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (userToBuy === null) throw [404, 'No user found with that ID.'];
	const checkingExists = await yahooFinance.search(verifiedStock_Ticker);
	if (checkingExists.count === 0) throw [404, 'Stock Ticker does not exist'];

	//confirmed stock and userexists now, getting price
	// let gettingPrice = await yahooFinance.quote(verifiedStock_Ticker, {fields: ["regularMarketPrice"]})
	const parsedDate = new Date(dateBought);
	const weekInPast = new Date(parsedDate.getTime() - 6.048e8); //6.048e+8 is one week in milliseconds
	const chartData = await yahooFinance.chart(verifiedStock_Ticker, {
		period1: weekInPast,
		period2: parsedDate,
		interval: '1d',
	});
	const gettingPrice = chartData.quotes[chartData.quotes.length - 1].close; //getting most recent, must be one quote within a week
	if (!gettingPrice) throw [500, 'Could not get price'];
	const buyCost = gettingPrice * verifiedVolume;

	//may have to check for multiplication error
	if (userToBuy.portfolio_information.capital < buyCost)
		throw [
			403,
			`Trying to buy ${stock_ticker} for a total of ${buyCost} with ${userToBuy.portfolio_information.capital}`,
		];

	//updating tickers, tradehistory, and capital
	let newTicker = null;
	// console.log(userToBuy.portfolio_information.tickers)
	const indexOfTicker = userToBuy.portfolio_information.tickers.findIndex(
		(ticker_elem) => ticker_elem.stock_ticker === verifiedStock_Ticker
	);
	if (indexOfTicker >= 0) {
		//ticker exists
		userToBuy.portfolio_information.tickers[indexOfTicker].volume +=
			verifiedVolume;
		newTicker = userToBuy.portfolio_information.tickers;
	} else {
		//adding new ticker to array and sorting, easier to find
		userToBuy.portfolio_information.tickers.push({
			stock_ticker: verifiedStock_Ticker,
			volume: verifiedVolume,
		});
		newTicker = userToBuy.portfolio_information.tickers.toSorted((a, b) => {
			return a.stock_ticker.localeCompare(b.stock_ticker);
		});
	}

	//adding new trade to front of array, most recent trades on top
	userToBuy.portfolio_information.trade_history.unshift({
		type: 'Buy',
		stock_ticker: verifiedStock_Ticker,
		volume: verifiedVolume,
		value: buyCost.toFixed(4),
		date: dateBought.toLocaleString(),
	});
	const newTradeHistory = userToBuy.portfolio_information.trade_history;
	const newCapital = userToBuy.portfolio_information.capital - buyCost;

	//updating collection
	const newPortfolioInformation = {
		capital: newCapital,
		portfolio_worth: userToBuy.portfolio_information.portfolio_worth,
		tickers: newTicker,
		trade_history: newTradeHistory,
	};

	const updatedInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } },
		{ returnDocument: 'after' }
	);
	//could set _id to id right here, idrc right now
	if (!updatedInfo) throw [500, 'Could not buy'];
	return newPortfolioInformation;
};

/**volume must be inputted as a string
 * THIS VARIENT IS ONLY INTENDED FOR USE IN SEEDING DATABASE, WILL NOT BE USED BY USERS
 */
const sellStockPast = async (userId, stock_ticker, volume, dateSold) => {
	const [verifiedUserId, verifiedStock_Ticker, verifiedVolume] =
		verifyStockAndUserPartial(userId, stock_ticker, volume);
	const userCollection = await users();
	const userToSell = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (userToSell === null) throw [404, 'No user found with that ID.'];
	const checkingExists = await yahooFinance.search(verifiedStock_Ticker);
	if (checkingExists.count === 0) throw [404, 'Stock Ticker does not exist'];

	//confirmed stock and userexists now, getting price
	//let gettingPrice = await yahooFinance.quote(verifiedStock_Ticker, {fields: ["regularMarketPrice"]})
	const parsedDate = new Date(dateSold);
	const weekInPast = new Date(parsedDate.getTime() - 6.048e8); //6.048e+8 is one week in milliseconds
	const chartData = await yahooFinance.chart(verifiedStock_Ticker, {
		period1: weekInPast,
		period2: parsedDate,
		interval: '1d',
	});

	const gettingPrice = chartData.quotes[chartData.quotes.length - 1].close; //getting most recent, must be one quote within a week
	if (!gettingPrice) throw [500, 'Could not get price'];
	const sellCost = gettingPrice * verifiedVolume;

	//may have to check for multiplication error
	let newTicker = userToSell.portfolio_information.tickers;
	const indexOfTicker = newTicker.findIndex(
		(ticker_elem) => ticker_elem.stock_ticker === verifiedStock_Ticker
	);
	if (indexOfTicker === -1) throw [400, 'User does not own this stock']
	if (newTicker[indexOfTicker].volume < verifiedVolume)
		throw [
			403,
			'User does not have enough owned shares to sell and make this trade',
		];

	//updating tickers, tradehistory, and capital
	//adding new ticker to array and sorting, easier to find
	if (newTicker[indexOfTicker].volume === verifiedVolume) {
		//case where selling all of stock, remove it from list
		newTicker.splice(indexOfTicker, 1);
	} else {
		newTicker[indexOfTicker].volume -= verifiedVolume;
	}

	//adding new trade to front of array, most recent trades on top
	userToSell.portfolio_information.trade_history.unshift({
		type: 'Sell',
		stock_ticker: verifiedStock_Ticker,
		volume: verifiedVolume,
		value: sellCost.toFixed(4),
		date: dateSold.toLocaleString(),
	});
	const newTradeHistory = userToSell.portfolio_information.trade_history;
	const newCapital = userToSell.portfolio_information.capital + sellCost;

	//updating collection
	const newPortfolioInformation = {
		capital: newCapital,
		portfolio_worth: userToSell.portfolio_information.portfolio_worth,
		tickers: newTicker,
		trade_history: newTradeHistory,
	};

	const updatedInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } },
		{ returnDocument: 'after' }
	);
	//could set _id to id right here, idrc right now
	if (!updatedInfo) throw [500, 'Could not sell'];
	return newPortfolioInformation;
};

//volume must be inputted as a string
const buyStock = async (userId, stock_ticker, volume) => {
	const [verifiedUserId, verifiedStock_Ticker, verifiedVolume] =
		verifyStockAndUserPartial(userId, stock_ticker, volume);
	const userCollection = await users();
	const userToBuy = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (userToBuy === null) throw [404, 'No user found with that ID.'];
	const checkingExists = await yahooFinance.search(verifiedStock_Ticker);
	if (checkingExists.count === 0) throw [404, 'Stock Ticker does not exist'];

	//confirmed stock and userexists now, getting price
	let gettingPrice = await yahooFinance.quote(verifiedStock_Ticker, {
		fields: ['regularMarketPrice'],
	});
	gettingPrice = gettingPrice['regularMarketPrice'];
	if (!gettingPrice) throw [500, 'Could not get price'];
	const buyCost = gettingPrice * verifiedVolume;

	//may have to check for multiplication error
	if (userToBuy.portfolio_information.capital < buyCost)
		throw [
			403,
			`Trying to buy ${stock_ticker} for a total of ${buyCost} with ${userToBuy.portfolio_information.capital}`,
		];

	//updating tickers, tradehistory, and capital
	let newTicker = null;
	const indexOfTicker = userToBuy.portfolio_information.tickers.findIndex(
		(ticker_elem) => ticker_elem.stock_ticker === verifiedStock_Ticker
	);
	if (indexOfTicker >= 0) {
		//ticker exists
		userToBuy.portfolio_information.tickers[indexOfTicker].volume +=
			verifiedVolume;
		newTicker = userToBuy.portfolio_information.tickers;
	} else {
		//adding new ticker to array and sorting, easier to find
		userToBuy.portfolio_information.tickers.push({
			stock_ticker: verifiedStock_Ticker,
			volume: verifiedVolume,
		});
		newTicker = userToBuy.portfolio_information.tickers.toSorted((a, b) => {
			return a.stock_ticker.localeCompare(b.stock_ticker);
		});
	}

	const now = new Date();
	//adding new trade to front of array, most recent trades on top
	userToBuy.portfolio_information.trade_history.unshift({
		type: 'Buy',
		stock_ticker: verifiedStock_Ticker,
		volume: verifiedVolume,
		value: buyCost.toFixed(4),
		date: now.toLocaleString(),
	});
	const newTradeHistory = userToBuy.portfolio_information.trade_history;
	const newCapital = userToBuy.portfolio_information.capital - buyCost;

	//updating collection
	const newPortfolioInformation = {
		capital: newCapital,
		portfolio_worth: userToBuy.portfolio_information.portfolio_worth,
		tickers: newTicker,
		trade_history: newTradeHistory,
	};

	const updatedInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } },
		{ returnDocument: 'after' }
	);
	//could set _id to id right here, idrc right now
	if (!updatedInfo) throw [500, 'Could not buy'];
	return newPortfolioInformation;
};

//volume must be inputted as a string
const sellStock = async (userId, stock_ticker, volume) => {
	const [verifiedUserId, verifiedStock_Ticker, verifiedVolume] =
		verifyStockAndUserPartial(userId, stock_ticker, volume);
	const userCollection = await users();
	const userToSell = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (userToSell === null) throw [404, 'No user found with that ID.'];
	const checkingExists = await yahooFinance.search(verifiedStock_Ticker);
	if (checkingExists.count === 0) throw [404, 'Stock Ticker does not exist'];

	//confirmed stock and userexists now, getting price
	let gettingPrice = await yahooFinance.quote(verifiedStock_Ticker, {
		fields: ['regularMarketPrice'],
	});
	gettingPrice = gettingPrice['regularMarketPrice'];
	if (!gettingPrice) throw [500, 'Could not get price'];
	const sellCost = gettingPrice * verifiedVolume;

	//may have to check for multiplication error
	let newTicker = userToSell.portfolio_information.tickers;
	const indexOfTicker = newTicker.findIndex(
		(ticker_elem) => ticker_elem.stock_ticker === verifiedStock_Ticker
	);
	if (indexOfTicker === -1) throw [400, 'User does not own this stock']
	if (newTicker[indexOfTicker].volume < verifiedVolume)
		throw [
			403,
			'User does not have enough owned shares to sell and make this trade',
		];

	//updating tickers, tradehistory, and capital
	//adding new ticker to array and sorting, easier to find
	if (newTicker[indexOfTicker].volume === verifiedVolume) {
		//case where selling all of stock, remove it from list
		newTicker.splice(indexOfTicker, 1);
	} else {
		newTicker[indexOfTicker].volume -= verifiedVolume;
	}

	const now = new Date();
	//adding new trade to front of array, most recent trades on top
	userToSell.portfolio_information.trade_history.unshift({
		type: 'Sell',
		stock_ticker: verifiedStock_Ticker,
		volume: verifiedVolume,
		value: sellCost.toFixed(4),
		date: now.toLocaleString(),
	});
	const newTradeHistory = userToSell.portfolio_information.trade_history;
	const newCapital = userToSell.portfolio_information.capital + sellCost;

	//updating collection
	const newPortfolioInformation = {
		capital: newCapital,
		portfolio_worth: userToSell.portfolio_information.portfolio_worth,
		tickers: newTicker,
		trade_history: newTradeHistory,
	};

	const updatedInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } },
		{ returnDocument: 'after' }
	);
	//could set _id to id right here, idrc right now
	if (!updatedInfo) throw [500, 'Could not sell'];
	return newPortfolioInformation;
};

async function getPortfolioWorthOverTime(userId) {
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	let capital = 100000; //inital amount of money user starts with, is set to 100000 currently
	const tradeHistory = userToInspect.portfolio_information.trade_history;
	if (tradeHistory.length === 0) return [];
	const tickers = [...new Set(tradeHistory.map((t) => t.stock_ticker))];
	const sortedTrades = [...tradeHistory].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	); //need to reverse array since it is stored newest first

	//getiing full date range from first to last trade
	const startDate = new Date(sortedTrades[0].date);
	const endDate = new Date();
	const dateList = [];
	for (
		let d = new Date(startDate);
		d <= endDate;
		d.setDate(d.getDate() + 1)
	) {
		dateList.push(new Date(d).toISOString().split('T')[0]);
	}

	//getting price history for each ticker
	const tickerPrices = {};
	for (const ticker of tickers) {
		const history = await yahooFinance.chart(ticker, {
			period1: dateList[0], //first buy
			interval: '1d',
			//range: '1y', in case we want to restrict it to only 1y or other metric, leaving unlimited for now
		});
		tickerPrices[ticker] = {};
		for (const { date, close } of history.quotes) {
			const d = new Date(date).toISOString().split('T')[0];
			tickerPrices[ticker][d] = close;
		}
	}
	const result = [];
	const holdings = {}; //{ticker: shares}
	let tradeIndex = 0;
	const lastKnownPrices = {};

	//main loop for calculating value
	for (const date of dateList) {
		while (
			tradeIndex < sortedTrades.length &&
			new Date(sortedTrades[tradeIndex].date)
				.toISOString()
				.split('T')[0] === date
		) {
			const trade = sortedTrades[tradeIndex];
			const volume = trade.volume;
			const tradePrice = parseFloat(trade.value); // getting logged price, since could have bought in at any point in day
			if (trade.type === 'Buy') {
				holdings[trade.stock_ticker] =
					(holdings[trade.stock_ticker] || 0) + volume;
				capital -= tradePrice;
			} else if (trade.type === 'Sell') {
				holdings[trade.stock_ticker] =
					(holdings[trade.stock_ticker] || 0) - volume;
				capital += tradePrice;
			}
			tradeIndex++;
		}

		//calculating portfolio value
		let investedValue = 0;
		for (const [ticker, volume] of Object.entries(holdings)) {
			if (volume <= 0) continue;

			const priceToday = tickerPrices[ticker]?.[date];
			if (priceToday !== undefined) {
				lastKnownPrices[ticker] = priceToday;
			}

			const priceToUse = lastKnownPrices[ticker];
			if (priceToUse !== undefined) {
				investedValue += volume * priceToUse;
			}
		}

		result.push({
			date,
			//both under can be used, but no purpose for them anymore
			investedValue: parseFloat(investedValue.toFixed(4)),
			capital: parseFloat(capital.toFixed(4)),
			totalValue: parseFloat((capital + investedValue).toFixed(4)),
		});
	}
	return result;
}

const getPortfolioWorthCurrentLeaderboardOnly = async (userId) => {
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	let total = userToInspect.portfolio_information.capital;
	for (const ticker of userToInspect.portfolio_information.tickers) {
		//console.log(ticker.stock_ticker)
		let gettingPrice = await yahooFinance.quote(ticker.stock_ticker, {
			fields: ['regularMarketPrice'],
		});
		gettingPrice = gettingPrice['regularMarketPrice'];
		if (!gettingPrice) throw [500, 'Could not get price'];
		//console.log(`${ticker.stock_ticker}: $${gettingPrice}`)
		total += gettingPrice * ticker.volume;
	}

	const newPortfolioInformation = {
		capital: userToInspect.portfolio_information.capital,
		portfolio_worth: total,
		tickers: userToInspect.portfolio_information.tickers,
		trade_history: userToInspect.portfolio_information.trade_history,
	};
	//updating in collection
	const result = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } }
	);
	if (!result) throw ['500', 'Could not update'];
	return {
		portfolio_worth: total,
	};
};

const getPortfolioWorthCurrent = async (userId) => {
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	let total = userToInspect.portfolio_information.capital;
	for (const ticker of userToInspect.portfolio_information.tickers) {
		//console.log(ticker.stock_ticker)
		let gettingPrice = await yahooFinance.quote(ticker.stock_ticker, {
			fields: ['regularMarketPrice'],
		});
		gettingPrice = gettingPrice['regularMarketPrice'];
		if (!gettingPrice) throw [500, 'Could not get price'];
		//console.log(`${ticker.stock_ticker}: $${gettingPrice}`)
		total += gettingPrice * ticker.volume;
	}

	const newPortfolioInformation = {
		capital: userToInspect.portfolio_information.capital,
		portfolio_worth: total,
		tickers: userToInspect.portfolio_information.tickers,
		trade_history: userToInspect.portfolio_information.trade_history,
	};
	//updating in collection
	const result = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(verifiedUserId) },
		{ $set: { portfolio_information: newPortfolioInformation } }
	);
	if (!result) throw ['500', 'Could not update'];
	let sharpeRatio = 0;
	try {
		sharpeRatio = await getSharpeRatio(verifiedUserId);
		return {
			portfolio_worth: total,
			capital: userToInspect.portfolio_information.capital,
			sharpeRatio: sharpeRatio,
		}
	} catch (e) {
		return {
			portfolio_worth: total,
			capital: userToInspect.portfolio_information.capital,
			sharpeRatio: 0,
		}
	}
};

const getCurrentValue = async (stock_ticker, volume) => {
	stock_ticker = verifyString(stock_ticker);
	volume = verifyString(volume);
	const volumeInt = parseInt(volume);
	let gettingPrice = await yahooFinance.quote(stock_ticker, {
		fields: ['regularMarketPrice'],
	});
	// console.log(gettingPrice)
	gettingPrice = gettingPrice['regularMarketPrice'];
	if (!gettingPrice) throw [500, 'Could not get price'];
	return {
		total_price: gettingPrice * volumeInt,
		price_per_share: gettingPrice,
	};
};

const getTopPortfolioProfiles = async () => {
	const usersCollection = await users();
	const allUsers = await usersCollection
		.find({}, { projection: { _id: 1 } })
		.toArray();

	for (const user of allUsers) {
		await getPortfolioWorthCurrentLeaderboardOnly(user._id.toString()); //will recalculate so leaderboard is accurate
	}
	let topProfiles = await usersCollection
		.find(
			{},
			{
				projection: {
					// Just project the username and portfolio
					filler_username: 1,
					'portfolio_information.portfolio_worth': 1,
					_id: 0,
				},
			}
		)
		.sort({ 'portfolio_information.portfolio_worth': -1 })
		.limit(10)
		.toArray();
	topProfiles = topProfiles.map((x) => {
		return {
			username: x.filler_username,
			portfolio_worth: x.portfolio_information.portfolio_worth,
		};
	});
	return topProfiles;
};

const resetPortfolio = async (userId) => {
	// Verify the user exists
	userData.getUserById(userId);
	const defaultPortfolio = {
		capital: 100000,
		portfolio_worth: 100000,
		tickers: [],
		trade_history: [],
	};
	const trimId = verifyId(userId);
	const userCollection = await users();
	const updateInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(trimId) },
		{ $set: { portfolio_information: defaultPortfolio } }
	);
	if (!updateInfo) throw [500, 'Could not reset portfolio.'];
	updateInfo._id = updateInfo._id.toString();
	return updateInfo;
};

const getStockTickers = async (userId) => {
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	if (!userToInspect.portfolio_information.tickers)
		throw [500, 'could not get stock tickers'];
	return userToInspect.portfolio_information.tickers;
};

const getCumulativeGains = async (userId) => {
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	const tradeHistory = userToInspect.portfolio_information.trade_history;

	const tickers = userToInspect.portfolio_information.tickers.map(
		(t) => t.stock_ticker
	);
	let allGainsByDate = {};

	for (const ticker of tickers) {
		const tickerTrades = tradeHistory.filter(
			(t) => t.stock_ticker === ticker
		);
		if (tickerTrades.length === 0) continue;

		const orderedDates = tickerTrades
			.map((t) => t.date)
			.sort((a, b) => {
				return Date.parse(a) - Date.parse(b);
			});
		// console.log(orderedDates[0])
		const firstDate = new Date(orderedDates[0]);
		const start = firstDate.toISOString().split('T')[0];
		const end = new Date().toISOString().split('T')[0];
		if(start === end) continue;

		const result = await yahooFinance.chart(ticker, {
			period1: start,
			period2: end,
			interval: '1d',
		});

		const history = result.quotes;
		if (!history || history.length === 0) continue;

		let volumeHeld = 0;
		let cumulativeGain = 0;

		for (let i = 0; i < history.length; i++) {
			const quote = history[i];
			const dateStr = new Date(quote.date).toISOString().split('T')[0];

			const tradesToday = tickerTrades.filter(
				(t) => new Date(t.date).toISOString().split('T')[0] === dateStr
			);

			let dailyGain = 0;

			for (const trade of tradesToday) {
				if (trade.type === 'Buy') {
					const gain = quote.close * trade.volume - trade.value;
					volumeHeld += trade.volume;
					dailyGain += gain;
				} else if (trade.type === 'Sell') {
					const gain = trade.value - quote.open * trade.volume;
					volumeHeld -= trade.volume;
					dailyGain += gain;
				}
			}

			if (tradesToday.length === 0 && volumeHeld > 0) {
				const prevClose = i > 0 ? history[i - 1].close : quote.open;
				const dayGain = volumeHeld * (quote.close - prevClose);
				dailyGain += dayGain;
			} else if (
				tradesToday.some((t) => t.type === 'Buy') &&
				volumeHeld > 0
			) {
				const dayGain = volumeHeld * (quote.close - quote.open);
				dailyGain += dayGain;
			}

			cumulativeGain += dailyGain;

			if (!allGainsByDate[dateStr]) allGainsByDate[dateStr] = 0;
			allGainsByDate[dateStr] += cumulativeGain;
		}
	}

	const sortedGains = Object.entries(allGainsByDate)
		.sort((a, b) => new Date(a[0]) - new Date(b[0]))
		.map(([date, cumulativeGain]) => ({
			date,
			cumulativeGain: parseFloat(cumulativeGain.toFixed(4)),
		}));

	return sortedGains;
};

const getVolatilityOverTime = async (userId, windowSize = 7) => {
	//this is too much math for a cs student, god has forsaken me
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	const tradeHistory = userToInspect.portfolio_information.trade_history;
	if (tradeHistory.length === 0) return [];

	const tickers = [...new Set(tradeHistory.map((t) => t.stock_ticker))];
	const sortedTrades = [...tradeHistory].sort(
		(a, b) => new Date(a.date) - new Date(b.date)
	);
	const startDate = new Date(sortedTrades[0].date);
	const endDate = new Date();
	const dateList = [];

	for (
		let d = new Date(startDate);
		d <= endDate;
		d.setDate(d.getDate() + 1)
	) {
		dateList.push(new Date(d).toISOString().split('T')[0]);
	}

	const tickerPrices = {};
	for (const ticker of tickers) {
		const history = await yahooFinance.chart(ticker, {
			period1: dateList[0],
			interval: '1d',
		});
		tickerPrices[ticker] = {};
		for (const { date, close } of history.quotes) {
			const d = new Date(date).toISOString().split('T')[0];
			tickerPrices[ticker][d] = close;
		}
	}

	let capital = 100000;
	const result = [];
	const holdings = {};
	const lastKnownPrices = {};
	let tradeIndex = 0;

	//compute daily portfolio value
	for (const date of dateList) {
		while (
			tradeIndex < sortedTrades.length &&
			new Date(sortedTrades[tradeIndex].date)
				.toISOString()
				.split('T')[0] === date
		) {
			const trade = sortedTrades[tradeIndex];
			const volume = trade.volume;
			const tradePrice = parseFloat(trade.value);
			if (trade.type === 'Buy') {
				holdings[trade.stock_ticker] =
					(holdings[trade.stock_ticker] || 0) + volume;
				capital -= tradePrice;
			} else if (trade.type === 'Sell') {
				holdings[trade.stock_ticker] =
					(holdings[trade.stock_ticker] || 0) - volume;
				capital += tradePrice;
			}
			tradeIndex++;
		}

		let investedValue = 0;
		for (const [ticker, volume] of Object.entries(holdings)) {
			if (volume <= 0) continue;
			const priceToday = tickerPrices[ticker]?.[date];
			if (priceToday !== undefined) {
				lastKnownPrices[ticker] = priceToday;
			}
			const priceToUse = lastKnownPrices[ticker];
			if (priceToUse !== undefined) {
				investedValue += volume * priceToUse;
			}
		}

		const totalValue = parseFloat((capital + investedValue).toFixed(4));
		result.push({ date, totalValue });
	}

	//compute daily percentage changes
	const percentChanges = [];
	for (let i = 1; i < result.length; i++) {
		const prev = result[i - 1].totalValue;
		const curr = result[i].totalValue;
		const change = (curr - prev) / prev;
		percentChanges.push({ date: result[i].date, change });
	}

	//rolling volatility using standard deviation of percent changes
	const volatilityResult = [];
	for (let i = windowSize - 1; i < percentChanges.length; i++) {
		const window = percentChanges
			.slice(i - windowSize + 1, i + 1)
			.map((p) => p.change);
		const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
		const variance =
			window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
			window.length;
		const stdDev = Math.sqrt(variance);
		volatilityResult.push({
			date: percentChanges[i].date,
			volatility: parseFloat((stdDev * 100).toFixed(4)),
		});
	}

	return volatilityResult;
};

const getSharpeRatio = async (userId) => {
	//oh boy
	const verifiedUserId = verifyId(userId);
	const userCollection = await users();
	const userToInspect = await userCollection.findOne({
		_id: new ObjectId(verifiedUserId),
	});
	if (!userToInspect) throw [400, 'user not found'];

	const tradeHistory = userToInspect.portfolio_information.trade_history;
	if (!tradeHistory || tradeHistory.length === 0)
		throw [400, 'no trade history'];

	//get portfolio value over time
	const worthData = await getPortfolioWorthOverTime(userId);
	if (worthData.length < 2) throw [400, 'not enough data for Sharpe Ratio'];

	//calculate daily returns
	const dailyReturns = [];
	for (let i = 1; i < worthData.length; i++) {
		const prev = worthData[i - 1].totalValue;
		const curr = worthData[i].totalValue;
		const dailyReturn = (curr - prev) / prev;
		dailyReturns.push(dailyReturn);
	}

	if (dailyReturns.length === 0)
		throw [500, 'no returns to calculate Sharpe Ratio'];

	const avgReturn =
		dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
	const stdDev = Math.sqrt(
		dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
			dailyReturns.length
	);

	if (stdDev === 0) return { sharpeRatio: 0 };

	//risk-free rate assumed 0
	return (avgReturn / stdDev) * Math.sqrt(252) //trading days in year;
};

const portfolioDataFunctions = {
	getTopPortfolioProfiles,
	buyStock,
	sellStock,
	getPortfolioWorthOverTime,
	getPortfolioWorthCurrent,
	buyStockPast,
	sellStockPast,
	getCurrentValue,
	resetPortfolio,
	getStockTickers,
	getCumulativeGains,
	getVolatilityOverTime,
};

export default portfolioDataFunctions;
