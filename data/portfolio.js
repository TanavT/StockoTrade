import { users } from '../config/mongodb/mongoCollections.js';

const getTopPortfolioProfiles = async () => {
	const usersCollection = await users();
	let topProfiles = await usersCollection
		.find(
			{},
			{
				projection: {
					// Just project the username and portfolio
					filler_username: 1,
					'portfolio_information.portfolio_worth': 1,
					_id: 0,
				},
			}
		)
		.sort({ 'portfolio_information.portfolio_worth': -1 })
		.limit(10)
		.toArray();
	topProfiles = topProfiles.map((x) => {
		return {
			username: x.filler_username,
			portfolio_worth: x.portfolio_information.portfolio_worth,
		};
	});
	return topProfiles;
};

console.log(await getTopPortfolioProfiles());

const portfolioDataFunctions = { getTopPortfolioProfiles };

export default portfolioDataFunctions;
