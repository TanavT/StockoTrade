import dashboardRouter from './dashboard.js';
import loginRouter from './login.js';
import signupRouter from './signup.js';
import logoutRouter from './logout.js';
import leaderboardRouter from './leaderboard.js'
// import stockRouter from './stock.js'

const setupRoutes = (app) => {
	// Just do a get because its our default route
	app.get('/', (req, res) => {
		const isLoggedIn = req.cookies.isAuthenticated; // Make sure they are logged in
		const userId = req.cookies.userID; // Make sure we have a userID cookies
		if (
			isLoggedIn &&
			userId &&
			isLoggedIn === 'true' &&
			userId !== 'null'
		) {
			return res.status(200).redirect(`/dashboard/${userId}`);
		} else {
			return res.status(200).render('home', { title: 'Home' });
		}
	});
	// Bind signup router
	app.use('/signup', signupRouter);
	// Bind login router
	app.use('/login', loginRouter);
	// Bind a logout router that just clears cookies
	app.use('/logout', logoutRouter);
	// Bind dashboard router
	app.use('/dashboard', dashboardRouter);
	// Bind leaderboard router
	app.use('/leaderboard', leaderboardRouter)
	// Bind stock router (stock pages)
	// app.use('/stock', stockRouter)
	// Bind universal router for invalid URL's
	app.use(/(.*)/, (req, res) => {
		// Set status code to 404 and render the error page
		return res.status(404).render('error', {
			errorCode: 404,
			title: '404 Error',
			errorMessage:
				"Seems like you are going to a page that doesn't exist.",
		});
	});
};

export default setupRoutes;
