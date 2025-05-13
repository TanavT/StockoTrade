

// Client side javascript to client-side verify form info for search
const searchStockForm = document.getElementById('searchBarStocksForm');
const searchBarStocks = document.getElementById('searchBarStocks');
const searchStockError = document.getElementById('searchstock-error');
if (searchStockForm) {
	function outputError(errorcode, message) {
		searchBarStocks.value = '';
		searchStockError.innerHTML = `${errorcode}: ${message}`;
		searchStockError.hidden = false;
	}
	searchStockForm.addEventListener('submit', async (event) => {
		event.preventDefault();
		try {
			verifyString(searchBarStocks.value, 'Ticker');
			await verifyTicker(searchBarStocks.value);
			// if (validity === false){
			// 	throw ['404', 'Invalid stock ticker entered']
			// }
			searchStockError.hidden = true;
			searchStockForm.submit();
		} catch (e) {
			outputError(e[0], e[1]);
		}
	});
}

const verifyTicker = async (ticker) => {
    let validity = null;
	await fetch(`/stock/verify/${ticker}`)
			.then((response) => response.json())
			.then((data) => {
				validity = data.validity;
                console.log(validity);
				
			});
    if (validity === false){
        throw ['404', 'Invalid stock ticker entered']
    }
    return validity;

}

const verifyString = (str, varName) => {
	if (!str) throw [400, `You must provide a ${varName}.`];
	if (typeof str !== 'string') throw [400, `${varName} must be a string.`];
	const trimStr = str.trim();
	if (trimStr.length < 1)
		throw [400, `${varName} cannot be an empty string or whitespace.`];
	return trimStr;
};