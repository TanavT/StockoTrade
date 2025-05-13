document.addEventListener('DOMContentLoaded', function () {
	const tickerElement = document
		.getElementById('tickerSymbol')
		.textContent.trim();

	try {
		fetch(`/stock/chart/${tickerElement}`)
			.then((response) => response.json())
			.then((data) => {
				const dates = data.chartLabels.map((dateStr) => {
					return new Date(dateStr);
				});
				const prices = data.chartPrices;

				const canvas = document.createElement('canvas');
				canvas.id = 'chartDiv';
				document.getElementById('portfolio-chart').appendChild(canvas);

				new Chart(canvas, {
					type: 'line',
					data: {
						labels: dates,
						datasets: [
							{
								label: `${tickerElement} Price`,
								data: prices,
								backgroundColor: 'rgba(58, 123, 184, 0.2)',
								borderColor: 'rgba(58, 123, 184, 1)',
								borderWidth: 2,
								fill: true,
								tension: 0.1,
							},
						],
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: true,
								text: `${tickerElement} Stock Price Over Time`,
								font: {
									size: 16,
								},
							},
							tooltip: {
								mode: 'index',
								intersect: false,
								callbacks: {
									label: function (context) {
										return `${tickerElement}: $${context.parsed.y.toFixed(
											2
										)}`;
									},
								},
							},
							legend: {
								display: false,
							},
						},
						scales: {
							x: {
								type: 'time',
								time: {
									unit: 'month',
									tooltipFormat: 'MMM D, YYYY',
									displayFormats: {
										month: 'MMM YYYY',
									},
								},
								grid: {
									display: false,
								},
								title: {
									display: true,
									text: 'Date',
								},
							},
							y: {
								beginAtZero: false,
								title: {
									display: true,
									text: 'Price ($)',
								},
								grid: {
									color: 'rgba(0, 0, 0, 0.05)',
								},
							},
						},
						interaction: {
							intersect: false,
							mode: 'nearest',
						},
					},
				});
			})
			.catch((error) => {
				console.error(
					`Could not display chart because of error: ${error}`
				);
			});
	} catch (e) {
		console.error('Error parsing chart data:', e);
	}
});



// Client side javascript to client-side verify form info for buy
const buyForm = document.getElementById('buy-form');
const buyQuantity = document.getElementById('buyQuantity');
const buyError = document.getElementById('buy-error');
const userAbleToBuy = document.getElementById('userAbleToBuy').textContent.trim();
if (buyForm) {
	function outputError(errorcode, message) {
		buyQuantity.value = '';
		buyError.innerHTML = `${errorcode}: ${message}`;
		buyError.hidden = false;
	}
	buyForm.addEventListener('submit', (event) => {
		event.preventDefault();
		try {
			verifyString(buyQuantity.value, 'buyQuantity');
			verifyBuy(buyQuantity.value);
			buyError.hidden = true;
			buyForm.submit();
		} catch (e) {
			outputError(e[0], e[1]);
		}
	});
}

// Client side javascript to client-side verify form info for sell
const sellForm = document.getElementById('sell-form');
const sellQuantity = document.getElementById('sellQuantity');
const sellError = document.getElementById('sell-error');
const userSharesOwned = document.getElementById('userSharesOwned').textContent.trim();
if (sellForm) {
	function outputError(errorcode, message) {
		sellQuantity.value = '';
		sellError.innerHTML = `${errorcode}: ${message}`;
		sellError.hidden = false;
	}
	sellForm.addEventListener('submit', (event) => {
		event.preventDefault();
		try {
			verifyString(sellQuantity.value, 'sellQuantity');
			verifySell(sellQuantity.value);
			sellError.hidden = true;
			sellForm.submit();
		} catch (e) {
			outputError(e[0], e[1]);
		}
	});
}

const verifyBuy = (buyQuantity) => {
	const pattern = /^[0-9]+$/;
	if (!pattern.test(buyQuantity.trim())){
		throw [400, ['buyQuantity must contain only numbers']]
	}
	let buyQuantityNUMBER = parseInt(buyQuantity);
	if (buyQuantityNUMBER < 1 || buyQuantityNUMBER > parseInt(userAbleToBuy)){
		throw [400, [`buyQuantity must be a positive integer between 1 and ${userAbleToBuy} inclusive`]]
	}

}

const verifySell = (sellQuantity) => {
	const pattern = /^[0-9]+$/;
	if (!pattern.test(sellQuantity.trim())){
		throw [400, ['sellQuantity must contain only numbers']]
	}
	let sellQuantityNUMBER = parseInt(sellQuantity);
	if (sellQuantityNUMBER < 1 || sellQuantityNUMBER > parseInt(userSharesOwned)){
		throw [400, [`sellQuantity must be a positive integer between 1 and ${userSharesOwned} inclusive`]]
	}

}

const verifyString = (str, varName) => {
	if (!str) throw [400, `You must provide a ${varName}.`];
	if (typeof str !== 'string') throw [400, `${varName} must be a string.`];
	const trimStr = str.trim();
	if (trimStr.length < 1)
		throw [400, `${varName} cannot be an empty string or whitespace.`];
	return trimStr;
};

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

