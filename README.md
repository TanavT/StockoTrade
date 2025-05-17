# StockoTrade

An application where users can invest in the stock market with real-time stock prices using fake money. This concept is known as “paper trading” and allows users to test different trading strategies with real time data. Usually this is a for-profit service that makes users have a subscription, but we provide it for free. This is a great way to practice trading while removing the risk associated with using real money. Users can compete against each other and view detailed statistics regarding their portfolios. Ultimately, they will gain invaluable knowledge to begin trading on the real stock market.

## Authors

- Joshua Hizgiaev
- Matthew Soltys
- Tanav Thota
- Hargun Sawhney

## Tech Stack

1. Frontend: Simple HTML and CSS
2. Backend: Express.js
3. Database: MongoDB
4. Data Visualization: chart.js
5. JavaScript runtime: Node.js

### Key dependencies

1. ``chart.js``
2. ``express``
3. ``mongodb``
4. ``yahoo-finance2``

## Instructions for usage

To run your own version of StockoTrade, please either clone the repository:

```git
git clone https://github.com/Josh-Hiz/StockoTrade.git
```

Or download the projects zip file. Once downloaded and viewing the project on VSCode or any other text editor, within the folder, on your terminal, run the following commands to install NPM packages and seed the database:

```git
npm install
npm run seed
npm start
```

This will install the required pacakges, seed the database, and start the web application hosted on localhost on port 3000. You must have MongoDB installed in order to interact with the database.

From there, you can now register new accounts, or login to existing ones, the seed file has the details of many example accounts. For demonstration purposes, we used the following example account:

Username: TanavT

Password: Password123!

### A few notes about finance

Given the nature of how financial portfolios work, data gets updated slowly and daily, immediate results on your portfolio volatility of cummulative gains should not be expected to be instant, especially when starting out. Thats why using premade accounts, with already populated portfolios over months is far more preferable to see our data visualization and statistics compared to a fresh account. In our premade accounts, the functions work the exact same! Just more data to comb through compared to fresh portfolio.

**We also recommend, to really see the numbers change dynamically, to test this within 9:30AM to 4PM during real trading hours!**

We try to make this as realistic as possible, we do this by following the market in **live time**. Which means trading starts at 9:30AM to 4PM EST time. Which means your portfolio will not be updated outside these ranges, because trading isnt happening at this time!

Regardless, investing is something that takes years to master, and making money can be slow, and arduous, but with patience, and through the correct decision making, one can make it big.

### Additonal notes we recommend reading

Due to the heavy computation, please let the leaderboard load, it takes at most 5-10 seconds. Thanks. In addition, given how heavy in computation our statistics are, we ask that you remain patient and wait for everything to load, the dashboard typically takes 2 seconds to load. Thank you!
