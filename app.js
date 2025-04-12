import express from 'express'
import exphbs from 'express-handlebars'
import morgan from 'morgan';

const app = express();

app.listen(3000, () => {
    console.log("Running StockoTrade server...")
    console.log("StockoTrade running on http://localhost:3000")
})
