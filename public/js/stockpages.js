

document.addEventListener('DOMContentLoaded', function() {

    const tickerElement = document.getElementById('tickerSymbol').textContent.trim();

    try {


        fetch(`/stock/chart/${tickerElement}`)
        .then((response) => response.json())
        .then((data) => {
            const dates = data.chartLabels.map(dateStr => {return new Date(dateStr)});
            const prices = data.chartPrices;

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


