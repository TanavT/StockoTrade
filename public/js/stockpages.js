

document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const tickerElement = document.getElementById('tickerSymbol').textContent.trim();
    // const labelsElement = document.getElementById('chartLabels');
    // const pricesElement = document.getElementById('chartPrices');
    
    // // Validate elements exist
    // if (!tickerElement || !labelsElement || !pricesElement) {
    //     console.error('Missing required chart data elements');
    //     return;
    // }
    
    // Parse data
    try {
        // const tickerSymbol = tickerElement.dataset.value;
        // const chartLabels = JSON.parse(labelsElement.dataset.value);
        // const chartPrices = JSON.parse(pricesElement.dataset.value);
        
        // Initialize chart
        // Prepare the data

        fetch(`/stock/chart/${tickerElement}`)
        .then((response) => response.json())
        .then((data) => {
            // const dates = chartLabels.map(dateStr => new Date(dateStr));
            // const prices = chartPrices;
            const dates = data.chartLabels.map(dateStr => {return new Date(dateStr)});
            const prices = data.chartPrices;

            console.log(dates)
            console.log(prices)

            const canvas = document.createElement('canvas');
            canvas.id = 'chartDiv';
            document.getElementById('portfolio-chart').appendChild(canvas);

            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: `${tickerElement} Price`,
                        data: prices,
                        backgroundColor: 'rgba(58, 123, 184, 0.2)',
                        borderColor: 'rgba(58, 123, 184, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: `${tickerElement} Stock Price Over Time`,
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    return `${tickerElement}: $${context.parsed.y.toFixed(2)}`;
                                }
                            }
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'month',
                                tooltipFormat: 'MMM D, YYYY',
                                displayFormats: {
                                    month: 'MMM YYYY'
                                }
                            },
                            grid: {
                                display: false
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Price ($)'
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'nearest'
                    }
                }
            });
            })
        .catch((error) => {
            console.error(`Could not display chart because of error: ${error}`)
        })

        
    } catch (e) {
        console.error('Error parsing chart data:', e);
    }
});


// let chartDiv = document.getElementById("portfolio-chart")
// fetch(`/stock/chart/${ticker}`)
//     .then((response) => response.json())
//     .then((data) => {
//         const parseDate = d3.timeParse("%Y-%m-%d");
//         data.forEach(d => d.date = parseDate(d.date));

//         //setting dimensions
//         const margin = { top: 20, right: 30, bottom: 30, left: 60 };
//         const width = 400 - margin.left - margin.right;
//         const height = 250 - margin.top - margin.bottom;

//         //creating svg inside the chartDiv
//         const svg = d3.select(chartDiv)
//             .append("svg")
//             .attr("class", "portfolio-svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom);

//         svg.append("text")
//             .attr("x", width / 2)
//             .attr("y", 15)
//             .attr("text-anchor", "middle")
//             .attr("class", "graph-title")
//             .text("Portfolio Value Over Time")

//         const g = svg.append("g")
//             .attr("class", "chart-group")
//             .attr("transform", `translate(${margin.left},${margin.top})`);

//         //scales
//         const x = d3.scaleTime()
//             .domain(d3.extent(data, d => d.date))
//             .range([0, width]);

//         const y = d3.scaleLinear()
//             .domain([0, d3.max(data, d => d.totalValue)])
//             .range([height, 0]);

//         //Axis
//         g.append("g")
//             .attr("class", "x-axis")
//             .attr("transform", `translate(0,${height})`)
//             .call(d3.axisBottom(x).ticks(5));

//         g.append("g")
//             .attr("class", "y-axis")
//             .call(d3.axisLeft(y));
        
//         //area
//         const area = d3.area()
//             .x(d => x(d.date))
//             .y0(height)
//             .y1(d => y(d.totalValue))

//         g.append("path")
//         .datum(data)
//         .attr("class", "portfolio-area")
//         .attr("d", area)

//         //line
//         const line = d3.line()
//             .x(d => x(d.date))
//             .y(d => y(d.totalValue));

//         g.append("path")
//             .datum(data)
//             .attr("class", "portfolio-line")
//             .attr("d", line);
//         })
//     .catch((error) => {
//         console.error(`Could not display chart because of error: ${error}`)
//     })