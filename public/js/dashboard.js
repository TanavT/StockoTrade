document.addEventListener("DOMContentLoaded", function () {
	const username = document.getElementById("userNameDisplay")
	const userId = username.getAttribute("userId")

	//selling buttons
	const sellForms = document.querySelectorAll('.sell-stock')
	sellForms.forEach( (form) => {
		form.addEventListener('submit', async(event) => {
			event.preventDefault()
			const stockTicker = form.dataset.stock_ticker;
	  		const input = form.querySelector(`input[name="sell_amount_${stockTicker}"]`);
	  		const sellAmount = input.value;
	  		// console.log(`Selling ${sellAmount} shares of ${stockTicker}`);
			fetch(`/dashboard/sell`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({userId, stockTicker, sellAmount})
			})
				.then((response => response.json()))
				.then((data) => {
					let updated_volume = null
					const index = data.tickers.findIndex((ticker_elem) => ticker_elem.stock_ticker === stockTicker)
					if (index === -1) {
						const row = document.getElementById(`row_${stockTicker}`);
						if (row) row.remove();
						updated_volume = 0
					} else {
						updated_volume = data.tickers[index].volume
						const volumeElement = document.getElementById(`volume_${stockTicker}`);
						volumeElement.innerHTML = `${updated_volume} shares`;
						input.max = updated_volume;
					}
					updateStockChart(stockTicker, updated_volume)
					updateTickers();
					// capital.innerHTML = `Current Capital: $${data.capital.toFixed(4)}`
					// portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(4)}`
				}) 
				.catch((error) => {
					console.error(`Could not display sell stock because of error: ${error}`)
				})
		})
	})


	//portfolio_worth
	let portfolioWorth = document.getElementById("portfolio_worth")
	let capital = document.getElementById("capital")
	fetch(`/dashboard/worth`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({userId})
	})
		.then((response => response.json()))
		.then((data) => {
			//console.log("response reached")
			capital.innerHTML = `Current Capital: $${data.capital.toFixed(4)}`
			portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(4)}`
		}) 
		.catch((error) => {
			console.error(`Could not display capital and portfolio worth because of error: ${error}`)
		})


	//tickers current value
	const updateTickers = () => {
		const rows = document.querySelectorAll('.tickers tr'); 
		for (let i = 1; i < rows.length; i++) {  // Skip the header row 
			const row = rows[i];
			const stock_ticker = row.querySelector('td a').innerHTML;
			const volume = (row.querySelectorAll('td')[1].innerHTML).split(" ")[0];
			const currentTotalValue = row.querySelectorAll('td')[2]
			const currentpricePerShare = row.querySelectorAll('td')[3]

			fetch(`/dashboard/getvalue/${stock_ticker}/${volume}`)
				.then((response) => response.json())
				.then((data) => {
					// console.log(data)
					currentTotalValue.innerHTML = `$${data.total_price.toFixed(4)}`
					currentpricePerShare.innerHTML = `$${data.price_per_share.toFixed(4)}`
				
				})
				.catch((error) => {
					console.error(`Could not display current value because of error: ${error}`)
				})
		}
	}
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

	//stock-chart
	let stock_pie_chart = null
	fetch(`/dashboard/chart/stocks/${userId}`)
		.then((response => response.json()))
		.then((data) => {
			console.log("response reached")
			const tickers = data.map(stock => stock.stock_ticker);
			const volumes = data.map(stock => stock.volume);

			const backgroundColors = tickers.map(() => {
			const r = Math.floor(Math.random() * 255);
			const g = Math.floor(Math.random() * 255);
			const b = Math.floor(Math.random() * 255);
			return `rgba(${r}, ${g}, ${b}, 0.6)`;
			});

			const chart_ctx = document.getElementById("stock-pie-chart").getContext("2d");

			stock_pie_chart = new Chart(chart_ctx, {
			type: 'pie',
			data: {
				labels: tickers,
				datasets: [{
				label: 'Stock Volume Owned',
				data: volumes,
				backgroundColor: backgroundColors,
				borderColor: 'rgba(255, 255, 255, 0.9)',
				borderWidth: 1
				}]
			},
			options: {
				responsive: true,
				plugins: {
				legend: {
					position: 'right'
				},
				title: {
					display: true,
					text: 'Your Portfolio by Volume'
				}
				}
			}
			});
		}) 
		.catch((error) => {
			console.error(`Could not display stock chart because of error: ${error}`)
		})
	//remove from stock chart
	function updateStockChart(stock_ticker, newVolume) {
		const ticker_index = stock_pie_chart.data.labels.indexOf(stock_ticker);
		if (ticker_index !== -1) {
			if (newVolume <= 0) { //just in case <=
				stock_pie_chart.data.labels.splice(ticker_index, 1);
				stock_pie_chart.data.datasets[0].data.splice(ticker_index, 1);
				stock_pie_chart.data.datasets[0].backgroundColor.splice(ticker_index, 1);
			} else {
				stock_pie_chart.data.datasets[0].data[ticker_index] = newVolume;
			}
			stock_pie_chart.update();
		}
	}
	//portfolio-chart
	let chartDiv = document.getElementById("portfolio-chart")
	fetch(`/dashboard/chart/portfolio/${userId}`)
		.then((response) => response.json())
		.then((data) => {
			const parseDate = d3.timeParse("%Y-%m-%d");
			data.forEach(d => d.date = parseDate(d.date));

			//setting dimensions
			const margin = { top: 20, right: 30, bottom: 30, left: 60 };
			const width = 450 - margin.left - margin.right;
			const height = 300 - margin.top - margin.bottom;

			//creating svg inside the chartDiv
			const svg = d3.select(chartDiv)
				.append("svg")
				.attr("class", "portfolio-svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

			svg.append("text")
				.attr("x", width / 2)
				.attr("y", 15)
				.attr("text-anchor", "middle")
				.attr("class", "graph-title")
				.text("Portfolio Value Over Time")

			const g = svg.append("g")
				.attr("class", "chart-group")
				.attr("transform", `translate(${margin.left},${margin.top})`);

			//scales
			const x = d3.scaleTime()
				.domain(d3.extent(data, d => d.date))
				.range([0, width]);

			const y = d3.scaleLinear()
				.domain([0, d3.max(data, d => d.totalValue)])
				.range([height, 0]);

			//Axis
			g.append("g")
				.attr("class", "x-axis")
				.attr("transform", `translate(0,${height})`)
				.call(d3.axisBottom(x).ticks(5));

			g.append("g")
				.attr("class", "y-axis")
				.call(d3.axisLeft(y));
			
			//area
			const area = d3.area()
				.x(d => x(d.date))
				.y0(height)
				.y1(d => y(d.totalValue))

			g.append("path")
			.datum(data)
			.attr("class", "portfolio-area")
			.attr("d", area)

			//line
			const line = d3.line()
				.x(d => x(d.date))
				.y(d => y(d.totalValue));

			g.append("path")
				.datum(data)
				.attr("class", "portfolio-line")
				.attr("d", line);
			})
		.catch((error) => {
			console.error(`Could not display chart because of error: ${error}`)
		})
	let pwButton = document.getElementById("recomputePortfolioWorth")

	pwButton.addEventListener("click", function (event) {
		event.preventDefault();
		fetch(`/dashboard/worth`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({userId})
		})
		.then((response => response.json()))
		.then((data) => {
			capital.innerHTML = `Current Capital: $${data.capital.toFixed(4)}`
			portfolioWorth.innerHTML = `Total Portfolio Worth: $${data.portfolio_worth.toFixed(4)}`
		}) 
		.catch((error) => {
			console.error(`Could not update capital and portfolio worth because of error: ${error}`)
		})
	})

    // let searchBarStocksForm = document.getElementById("searchBarStocksForm");
    // if (searchBarStocksForm){
    //     searchBarStocksForm.addEventListener("submit", function(event) {
    //         event.preventDefault();
    //         let searchStockInput = document.getElementById("searchBarStocks").value.trim().toUpperCase();
    //         if (searchStockInput){
    //             fetch(`/dashboard/verify/${searchStockInput}`)
    //             .then((response => response.json()))
    //             .then((data) => {
    //                 if (data === true){
    //                     searchBarStocksForm.submit();
    //                 }
    //             }) 
    //             .catch((error) => {
    //                 console.error(`Could not search for stock because of error: ${error}`)
    //             })
    //         }
    //     })
    // }

})

