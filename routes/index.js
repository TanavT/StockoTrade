import dashboardRouter from './dashboard.js';

const setupRoutes = (app) => {
	// Just do a get because its our default route
	app.get('/', (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
		if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
			// dashboard rendering logic via express redirect() method, NOT send()
			return res
				.status(200)
				.send('Welcome back -- dashboard coming soon!');
		} else {
			// Set the status code to 200 OK and render the home page server side
			return res.status(200).render('home');
		}
	});
	// Bind signup router
	app.use('/signup', (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
		if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
			// dashboard rendering logic via express redirect() method, NOT send()
			return res
				.status(200)
				.send('Welcome back -- dashboard coming soon!');
		} else {
			// Set the status code to 200 OK and render the home page server side
			return res.status(200).render('signup');
		}
	});
	// Bind signup router
	app.use('/login', (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
		if (isLoggedIn && userId && isLoggedIn === 'true' && userId !== 'null') {
			// dashboard rendering logic via express redirect() method, NOT send()
			return res
				.status(200)
				.send('Welcome back -- dashboard coming soon!');
		} else {
			// Set the status code to 200 OK and render the home page server side
			return res.status(200).render('login');
		}
	});
	// Bind dashboard router
	app.use('/dashboard', dashboardRouter);
	// Bind universal router for invalid URL's
	app.use(/(.*)/, (req, res) => {
		// Set status code to 404 and render the error page
		return res
			.status(404)
			.render('error', {
				errorCode: 404
			});
	});
};

export default setupRoutes;
