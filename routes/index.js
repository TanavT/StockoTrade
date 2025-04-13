const setupRoutes = (app) => {
    app.get('/', (req, res) => {
        if(req.isAuthenticated) {
            // dashboard rendering logic
            return res.send('Welcome back -- dashboard coming soon!');
        } else {
            return res.render('home');
        }
    })
    app.use(/(.*)/, (req, res) => {
        return res.status(404).json({error: 'Route Not Found'});
    })
}

export default setupRoutes