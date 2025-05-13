import { Router } from 'express';
import { portfolioData, stockData } from '../data/index.js';
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
        console.log(ticker)
        
        
        const isLoggedIn = req.cookies.isAuthenticated;
        const userId = req.cookies.userID;
        if (!ticker) {
            // if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
            //     return res.redirect(`/dashboard/${userId}`);
            // } else {
            //     return res.redirect('/');
            // }
            return res.status(404).render('error', {
                errorCode: "404",
                errorMessage: `Stock with ticker ${ticker} not found`
            });
        }

        // Proceed with stock data fetching if ticker exists
        // if (ticker.length > 5){
        //     if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
        //         return res.redirect(`/dashboard/${userId}`);
        //     } else {
        //         return res.redirect('/');
        //     }
        // }

        const validated = await stockData.validateStockTicker(ticker);
        if (!validated){
            // if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
            //     return res.redirect(`/dashboard/${userId}`);
            // } else {
            //     return res.redirect('/');
            // }
            return res.status(404).render('error', {
                errorCode: "404",
                errorMessage: `Stock with ticker ${ticker} not found`
            });
        }

        


        let data = await stockData.getStockData(ticker); 

        console.log("LIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLSLIGMA BALLS")
        
        if (!data) {
            return res.status(404).render('error', {
                errorCode: "404",
                errorMessage: `Stock with ticker ${ticker} not found`
            });
        }

        

        // if (data.error !== null){
        //     return res.status(404).render('error', {
        //         errorCode: "404",
        //         errorMessage: data.error
        //     });
        // }
        // data = data.data;


        if (data.chartLabels === null || data.chartPrices === null || data.chartLabels === undefined || data.chartPrices === undefined) {
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
                graphTrue: false
            });
        }
        else{
            res.status(200).render('stock', {
                title: `${data.companyName} (${ticker})`,
                scriptPaths: ['stockpages.js'],
                outsidePaths: ['https://cdn.jsdelivr.net/npm/chart.js', 'https://cdn.jsdelivr.net/npm/moment', 'https://cdn.jsdelivr.net/npm/chartjs-adapter-moment'],
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
                graphTrue: true
            });
        }

        

    } catch (e) {
        res.status(500).render('error', { 
            errorCode: "500",
            errorMessage: `Stock with ticker ${ticker} not found`
        });
    }
});

router.get('/chart/:ticker', async (req, res) => {

    console.log("WE HERE WE HERE WE HERE WE HERE WE HERE ")
    let ticker = null;
    if (req.params.ticker) {
        const checkTicker = xss(req.params.ticker.trim());
        ticker = checkTicker.toUpperCase();
    }

    console.log(ticker)

    try {

        let data = await stockData.getStockData(ticker); 
        
        const validated = await stockData.validateStockTicker(ticker);
        if (!validated){
            return res.status(404).render('error', {
                errorCode: "404",
                errorMessage: `Stock with ticker ${ticker} not found`
            });
        }

        if (!data) {
            return res.status(404).render('error', {
                errorCode: "404",
                errorMessage: `Stock with ticker ${ticker} not found`
            });
        }

        // if (data.error !== null){
        //     return res.status(404).render('error', {
        //         errorCode: "404",
        //         errorMessage: data.error
        //     });
        // }
        // data = data.data;

        console.log(data.chartLabels)
        console.log(data.chartPrices)

        res.json({chartLabels: data.chartLabels,
            chartPrices: data.chartPrices
        })

    } catch (e) {
        res.status(500).render('error', { 
            errorCode: "500",
            errorMessage: `Stock with ticker ${ticker} not found`
        });
    }
});

router.route('/:stockTicker').get(async (req, res) => {
    try {
        req.params.stockTicker = verifyString(req.params.stockTicker, "stockTicker")
    } catch (e) {
        const errorCode = e[0];
        return res.status(errorCode).render('error', {
            errorCode: errorCode,
            title: `${errorCode} Error`,
            errorMessage: e[1],
        });
    }
    return res.status(200).render('stock', {isLoggedIn: true, title: req.params.stockTicker, scriptPaths: ['searchBar.js']})
})

export default router;