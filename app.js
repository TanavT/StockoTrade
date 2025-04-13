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

// Init app
const app = express();

// Set up logging middleware
const stream = {
	write: (message) => logger.http(message),
};
app.use(morgan('dev', { stream: stream }));

// Setup default middlewares
app.use(cookieParser());
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// Setup templating engine
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Default route will just render home unless cookies permits something else
app.use('/', (req, res, next) => {
	const isLoggedIn = req.cookies.isLoggedIn; // Make sure they are logged in
	const userId = req.cookies.userID; // Make sure we have a userID cookies
	if (isLoggedIn && userId && isLoggedIn === 'true') {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);
		res.cookie('isLoggedIn', 'true', { expires: expiresAt });
		res.cookie('userID', req.cookies.userID, { expires: expiresAt });
		// Set an authentication variable to be used in route
		req.isAuthenticated = true;
	} else {
		req.isAuthenticated = false;
	}
	next();
});

// Apply remaining routes
setupRoutes(app);

// Begin listening
app.listen(3000, () => {
	console.log('Running StockoTrade server...');
	console.log('StockoTrade running on http://localhost:3000');
});
