document.addEventListener('DOMContentLoaded', function () {
	const username = document.getElementById('userNameDisplay');
	const userId = username.dataset.userid;

	//selling buttons
	const sellForms = document.querySelectorAll('.sell-stock');
	sellForms.forEach((form) => {
		form.addEventListener('submit', async (event) => {
			event.preventDefault();
			const stockTicker = form.dataset.stock_ticker;
			const input = form.querySelector(
				`input[name="sell_amount_${stockTicker}"]`
			);
			const sellAmount = input.value; 
			if (isNaN(sellAmount) || sellAmount.trim() === "" || parseInt(sellAmount) <= 0 || parseInt(sellAmount) > input.max) {
				alert(`You cannot sell ${sellAmount}, please enter a valid share amount.`);
				input.focus();
				return;
			}

			// console.log(`Selling ${sellAmount} shares of ${stockTicker}`);
			fetch(`/dashboard/sell`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ userId, stockTicker, sellAmount }),
			})
				.then((response) => response.json())
				.then((data) => {
					let updated_volume = null;
					const index = data.tickers.findIndex(
						(ticker_elem) =>
							ticker_elem.stock_ticker === stockTicker
					);
					if (index === -1) {
						const row = document.getElementById(
							`row_${stockTicker}`
						);
						if (row) row.remove();
						updated_volume = 0;
					} else {
						updated_volume = data.tickers[index].volume;
						const volumeElement = document.getElementById(
							`volume_${stockTicker}`
						);
						volumeElement.innerHTML = `${updated_volume} shares`;
						input.max = updated_volume;
					}
					// console.log(`${stockTicker} ${updated_volume}`)
					addTradeRow("Sell", form.dataset.stock_ticker, sellAmount)
					updateStockChart(stockTicker, updated_volume);
					updateTickers();
					// capital.innerHTML = `Current Capital: $${data.capital.toFixed(4)}`
					// portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(4)}`
				})
				.catch((error) => {
					console.error(
						`Could not display sell stock because of error: ${error}`
					);
				});
		});
	});
	const trade_table = document.getElementById('trades');
	//Basically just for selling
	const addTradeRow = (type, stock_ticker, volume) => {
		// console.log(`${stock_ticker} ${volume}`)
		fetch(`/dashboard/getvalue/${stock_ticker}/${volume}`)
				.then((response) => response.json())
				.then((data) => {
					console.log(data)
					const newRow = document.createElement('tr');
					newRow.innerHTML = `
						<td>${type}</td>
						<td>${stock_ticker}</td>
						<td>${volume} shares</td>
						<td>$${(data.price_per_share * volume).toFixed(4)}</td>
						<td>${new Date()}</td>
					`;
					const rows = trade_table.getElementsByTagName('tr');
					if (rows.length > 1) {
						rows[0].parentNode.insertBefore(newRow, rows[1]);
					} else {
						trade_table.appendChild(newRow);
					}
				})
				.catch((error) => {
					console.error(
						`Could not update trade history because of error: ${error}`
					);
				});
	}


	//portfolio_worth
	let portfolioWorth = document.getElementById('portfolio_worth');
	let capital = document.getElementById('capital');
	let sharpeRatio = document.getElementById('sharpe_ratio');
	fetch(`/dashboard/worth`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userId }),
	})
		.then((response) => {
			// console.log(response)
			return response.json()})
		.then((data) => {
			// console.log(data)
			capital.innerHTML = `Current Capital: $${data.capital.toFixed(4)}`;
			portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(
				4
			)}`;
			if (data.sharpeRatio) {
				sharpeRatio.innerHTML = `Annualized Sharpe Ratio: ${data.sharpeRatio.toFixed(
					4
				)}`;
			} else {
				sharpeRatio.innerHTML = `Annualized Sharpe Ratio: 0`;
			}
		})
		.catch((error) => {
			console.error(
				`Could not display sharpe ratio, capital, and portfolio worth because of error: ${error}`
			);
		});

	//tickers current value
	const updateTickers = () => {
		const rows = document.querySelectorAll('.tickers tr');
		for (let i = 1; i < rows.length; i++) {
			// Skip the header row
			const row = rows[i];
			const stock_ticker = row.querySelector('td a').innerHTML;
			const volume = row
				.querySelectorAll('td')[1]
				.innerHTML.split(' ')[0];
			const currentTotalValue = row.querySelectorAll('td')[2];
			const currentpricePerShare = row.querySelectorAll('td')[3];

			fetch(`/dashboard/getvalue/${stock_ticker}/${volume}`)
				.then((response) => response.json())
				.then((data) => {
					// console.log(data)
					currentTotalValue.innerHTML = `$${data.total_price.toFixed(
						4
					)}`;
					currentpricePerShare.innerHTML = `$${data.price_per_share.toFixed(
						4
					)}`;
				})
				.catch((error) => {
					console.error(
						`Could not display current value because of error: ${error}`
					);
				});
		}
	};
	updateTickers(); //run once at page load

	//refresh button
	const refreshButton = document.getElementById('refresh_button');
	if (refreshButton) {
		refreshButton.addEventListener('click', (event) => {
			// console.log("button clicked")
			event.preventDefault(); //just in case
			updateTickers();
		});
	}

	//volatility Chart
	let volatility_chart = null;
	fetch(`/dashboard/chart/volatility/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			// console.log(data)
			const chart_ctx = document
				.getElementById('volatility-chart')
				.getContext('2d');

			const chartData = data.map((day) => ({
				x: new Date(day.date),
				y: day.volatility,
			}));

			volatility_chart = new Chart(chart_ctx, {
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Daily Volatility (%)',
							data: chartData,
							backgroundColor: 'rgba(255, 99, 132, 0.3)',
							borderColor: 'rgb(255, 99, 132)',
							borderWidth: 2,
							fill: true,
							tension: 0.2,
						},
					],
				},
				options: {
					responsive: true,
					scales: {
						x: {
							type: 'time',
							time: {
								unit: 'day',
							},
							title: {
								display: true,
								text: 'Date',
							},
						},
						y: {
							title: {
								display: true,
								text: 'Volatility (%)',
								suggestedMin: 0,
								suggestedMax: 10,
							},
						},
					},
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Portfolio Daily Volatility (%)',
						},
					},
				},
			});
		})
		.catch((error) => {
			console.error(
				`Could not display returns chart because of error: ${error}`
			);
		});

	//gains Chart
	let gains_chart = null;
	fetch(`/dashboard/chart/gains/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			// console.log(data)
			const chart_ctx = document
				.getElementById('gains-chart')
				.getContext('2d');

			const chartData = data.map((day) => ({
				x: new Date(day.date),
				y: day.cumulativeGain,
			}));

			gains_chart = new Chart(chart_ctx, {
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Cumulative Returns Per Day ($)',
							data: chartData,
							backgroundColor: 'rgba(96, 156, 103, 0.5)',
							borderColor: 'rgb(7, 171, 18)',
							borderWidth: 2,
							fill: true,
							tension: 0.2,
						},
					],
				},
				options: {
					responsive: true,
					scales: {
						x: {
							type: 'time',
							time: {
								unit: 'day',
							},
							title: {
								display: true,
								text: 'Date',
							},
						},
						y: {
							title: {
								display: true,
								text: 'Cumulative Return ($)',
							},
							suggestedMin: -10000,
							suggestedMax: 10000,
						},
					},
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Cumulative Return Per Day ($)',
						},
					},
				},
			});
		})
		.catch((error) => {
			console.error(
				`Could not display returns chart because of error: ${error}`
			);
		});
	//stock-chart
	let stock_pie_chart = null;
	fetch(`/dashboard/chart/stocks/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			// console.log("response reached")
			const tickers = data.map((stock) => stock.stock_ticker);
			const volumes = data.map((stock) => stock.volume);

			const backgroundColors = tickers.map(() => {
				const r = Math.floor(Math.random() * 255);
				const g = Math.floor(Math.random() * 255);
				const b = Math.floor(Math.random() * 255);
				return `rgba(${r}, ${g}, ${b}, 0.6)`;
			});

			const chart_ctx = document
				.getElementById('stock-pie-chart')
				.getContext('2d');

			stock_pie_chart = new Chart(chart_ctx, {
				type: 'pie',
				data: {
					labels: tickers,
					datasets: [
						{
							label: 'Stock Volume Owned',
							data: volumes,
							backgroundColor: backgroundColors,
							borderColor: 'rgba(255, 255, 255, 0.9)',
							borderWidth: 1,
						},
					],
				},
				options: {
					responsive: true,
					plugins: {
						legend: {
							position: 'right',
						},
						title: {
							display: true,
							text: 'Your Portfolio by Volume',
						},
					},
				},
			});
		})
		.catch((error) => {
			console.error(
				`Could not display stock chart because of error: ${error}`
			);
		});
	//remove from stock chart
	function updateStockChart(stock_ticker, newVolume) {
		const ticker_index = stock_pie_chart.data.labels.indexOf(stock_ticker);
		if (ticker_index !== -1) {
			if (newVolume <= 0) {
				//just in case <=
				stock_pie_chart.data.labels.splice(ticker_index, 1);
				stock_pie_chart.data.datasets[0].data.splice(ticker_index, 1);
				stock_pie_chart.data.datasets[0].backgroundColor.splice(
					ticker_index,
					1
				);
			} else {
				stock_pie_chart.data.datasets[0].data[ticker_index] = newVolume;
			}
			stock_pie_chart.update();
		}
	}
	//portfolio-chart
	let chartDiv = document.getElementById('portfolio-chart');
	fetch(`/dashboard/chart/portfolio/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			const chart_ctx = document
				.getElementById('portfolio-chart')
				.getContext('2d');

			// Parse dates and prepare data
			const chartData = data.map((day) => ({
				x: new Date(day.date), // assuming date is still in "YYYY-MM-DD" format
				y: day.totalValue,
			}));

			portfolio_chart = new Chart(chart_ctx, {
				type: 'line',
				data: {
					datasets: [
						{
							label: 'Portfolio Value ($)',
							data: chartData,
							backgroundColor: 'rgba(47, 255, 19, 0.55)',
							borderColor: 'rgba(15, 137, 15, 0.61)',
							borderWidth: 2,
							fill: true,
							tension: 0.2,
						},
					],
				},
				options: {
					responsive: true,
					scales: {
						x: {
							type: 'time',
							time: {
								unit: 'day',
							},
							title: {
								display: true,
								text: 'Date',
							},
							ticks: {
								maxTicksLimit: 5,
							},
						},
						y: {
							title: {
								display: true,
								text: 'Portfolio Value ($)',
							},
							beginAtZero: true,
						},
					},
					plugins: {
						legend: {
							position: 'top',
						},
						title: {
							display: true,
							text: 'Portfolio Value Over Time',
						},
					},
				},
			});
		})
		.catch((error) => {
			console.error(`Could not display chart because of error: ${error}`);
		});
	let pwButton = document.getElementById('recomputePortfolioWorth');

	pwButton.addEventListener('click', function (event) {
		event.preventDefault();
		fetch(`/dashboard/worth`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userId }),
		})
			.then((response) => response.json())
			.then((data) => {
				capital.innerHTML = `Current Capital: $${data.capital.toFixed(
					4
				)}`;
				portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(
					4
				)}`;
				if (data.sharpeRatio) {
					sharpeRatio.innerHTML = `Annualized Sharpe Ratio: ${data.sharpeRatio.toFixed(
						4
					)}`;
				} else {
					sharpeRatio.innerHTML = `Annualized Sharpe Ratio: 0`;
				}
			})
			.catch((error) => {
				console.error(
					`Could not update capital and portfolio worth because of error: ${error}`
				);
			});
	});
});
