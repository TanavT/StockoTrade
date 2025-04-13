const setupRoutes = (app) => {
    app.use(/(.*)/, (req, res) => {
        return res.status(404).json({error: 'Route Not Found'});
    })
}

export default setupRoutes