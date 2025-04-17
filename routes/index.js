import dashboardRouter from './dashboard.js';
import loginRouter from './login.js';
import signupRouter from './signup.js';

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
	// Bind dashboard router
	app.use('/dashboard', dashboardRouter);
	// Bind universal router for invalid URL's
	app.use(/(.*)/, (req, res) => {
		// Set status code to 404 and render the error page
		return res.status(404).render('error', {
			errorCode: 404,
			title: '404',
			errorMessage: "Seems like you are going to a page that doesn't exist."
		});
	});
};

export default setupRoutes;
