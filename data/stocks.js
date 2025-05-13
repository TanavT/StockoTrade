import yahooFinance from 'yahoo-finance2';
yahooFinance.suppressNotices(['yahooSurvey']); //I gave you your survey, stop sending this message :(

import { ObjectId } from 'mongodb';
import { users } from '../config/mongodb/mongoCollections.js';
import {
	verifyStockAndUserPartial,
	verifyId,
} from '../utils/auth/user_data.js';

const validateStockTicker = async (ticker) => {
	const result = await yahooFinance.search(ticker);
	if (result.count === 0) return false;
	else return true;
};

const getStockData = async (ticker) => {
	const quote = await yahooFinance.quote(ticker);
	const quoteSummary = await yahooFinance.quoteSummary(ticker);
	const quoteSummary2 = await yahooFinance.quoteSummary(ticker, {
		modules: ['assetProfile'],
	});

	const endDate = new Date();
	const startDate = new Date();
	startDate.setFullYear(startDate.getFullYear() - 1);

	const formatDate = (date) => {
		return `${date.getFullYear()}-${(date.getMonth() + 1)
			.toString()
			.padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
	};

	const history = await yahooFinance.chart(ticker, {
		period1: formatDate(startDate),
		period2: formatDate(endDate),
		interval: '1d',
	});

	const quotes = history.quotes;

	const last365 = quotes
		.map((day) => ({
			date: new Date(day.date),
			close: day.close,
		}))
		.sort((a, b) => a.date - b.date);

	const chartLabels = last365.map((day) =>
		day.date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	);

	const chartPrices = last365.map((day) => day.close);

	let data = {
		companyName: quote.longName,
		summary: quoteSummary2.assetProfile.longBusinessSummary,
		currentPrice: 'N/A',
		isPositive: quote.regularMarketChange >= 0,
		priceChange: 'N/A',
		percentChange: 'N/A',
		openPrice: 'N/A',
		previousClose: 'N/A',
		dayHigh: 'N/A',
		dayLow: 'N/A',
		volume: quote.regularMarketVolume,
		marketCap: 'N/A',
		chartLabels: chartLabels,
		chartPrices: chartPrices,
		marketCapAbbrev: 'N/A',
		currentPriceNUMBER: null,
	};


	console.log(typeof quote.regularMarketChange)
	let marketCapAbbrev = 'N/A';

	if (data.companyName === null || data.companyName === undefined) {
		data.companyName = '';
	}
	if (data.summary === null || data.summary === undefined) {
		data.summary = '';
	}
	if (
		quote.regularMarketPrice !== null &&
		quote.regularMarketPrice !== undefined
	) {
		data.currentPrice = '$' + quote.regularMarketPrice.toString();
		data.currentPriceNUMBER = quote.regularMarketPrice;
	}
	if (quote.regularMarketChange === null || quote.regularMarketChange === undefined) {
		data.isPositive = true;
	}
	if (
		quote.regularMarketChange !== null &&
		quote.regularMarketChange !== undefined
	) {
		data.priceChange =
			'$' + quote.regularMarketChange.toFixed(2).toString();
	}
	if (quote.percentChange !== null || quote.percentChange !== undefined) {
		data.percentChange = quote.regularMarketChangePercent.toFixed(2) + '%';
	}
	if (
		quote.regularMarketOpen !== null &&
		quote.regularMarketOpen !== undefined
	) {
		data.openPrice = '$' + quote.regularMarketOpen.toString();
	}
	if (
		quote.regularMarketPreviousClose !== null &&
		quote.regularMarketPreviousClose !== undefined
	) {
		data.previousClose = '$' + quote.regularMarketPreviousClose.toString();
	}
	if (
		quote.regularMarketDayHigh !== null &&
		quote.regularMarketDayHigh !== undefined
	) {
		data.dayHigh = '$' + quote.regularMarketDayHigh.toString();
	}
	if (
		quote.regularMarketDayLow !== null &&
		quote.regularMarketDayLow !== undefined
	) {
		data.dayLow = '$' + quote.regularMarketDayLow.toString();
	}
	if (
		quote.regularMarketVolume === null ||
		quote.regularMarketVolume === undefined
	) {
		data.volume = 'N/A';
	}
	if (quote.marketCap !== null && quote.marketCap !== undefined) {
		data.marketCap = '$' + quote.marketCap.toString();

		const absMarketCap = Math.abs(quote.marketCap);
		const suffixes = [
			{ value: 1e12, symbol: 'T' },
			{ value: 1e9, symbol: 'B' },
			{ value: 1e6, symbol: 'M' },
			{ value: 1e3, symbol: 'K' },
		];

		marketCapAbbrev = quote.marketCap.toString();

		for (const { value, symbol } of suffixes) {
			if (absMarketCap >= value) {
				marketCapAbbrev =
					'$' +
					(quote.marketCap / value).toFixed(2).replace(/\.00$/, '') +
					symbol;
				break;
			}
		}

		data.marketCapAbbrev = marketCapAbbrev;
	}

	return data;
};

const stockDataFunctions = { validateStockTicker, getStockData };

export default stockDataFunctions;
