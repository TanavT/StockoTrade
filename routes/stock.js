import { Router } from 'express';
import { portfolioData } from '../data/index.js';
const router = Router();
import { verifyString } from '../utils/auth/user_data.js';

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

export default router