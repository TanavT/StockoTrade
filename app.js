import express from 'express';
import exphbs from 'express-handlebars';
import morgan from 'morgan';
import logger from './utils/logger.js';
import setupRoutes from './routes/index.js';
import cookieParser from 'cookie-parser';

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
	if (req.body && req.body._method) {
		req.method = req.body._method;
		delete req.body._method;
	}

	// let the next middleware run:
	next();
};

const app = express();

// Set up logging middleware
const stream = {
	write: (message) => logger.http(message),
};
app.use(morgan('dev', { stream: stream }));

// Setup default middlewares
app.use(cookieParser())
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// Setup templating engine
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Default route will just render home unless cookies permits something else
app.use('/', (req,res,next) => {
    const isLoggedIn = req.cookies.isLoggedIn;
    if(!isLoggedIn || isLoggedIn === 'false') {
        next();
        return res.render('home')
    } else {
        // Update cookie expiration
        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours+2);
        res.cookie('isLoggedIn', now.toString(), {expires: expiresAt})
        // Call next on the middleware
        next();
        // Figure out a way to render this dashboard...
        return;
    }
})

setupRoutes(app);

// Begin listening
app.listen(3000, () => {
	console.log('Running StockoTrade server...');
	console.log('StockoTrade running on http://localhost:3000');
});
