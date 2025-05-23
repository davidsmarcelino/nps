// js/charts.js
function renderCharts(data) {
    renderDistributionChart(data.distribution);
    renderTrendChart(data.trends);
}

function renderDistributionChart(distribution) {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) {
        console.error('Canvas distributionChart não encontrado');
        return;
    }
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            datasets: [{
                label: 'Número de respostas',
                data: distribution,
                backgroundColor: [
                    '#e74c3c', '#e74c3c', '#e74c3c',
                    '#f39c12', '#f39c12', '#f39c12', '#f39c12',
                    '#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71'
                ],
                borderColor: [
                    '#c0392b', '#c0392b', '#c0392b',
                    '#e67e22', '#e67e22', '#e67e22', '#e67e22',
                    '#27ae60', '#27ae60', '#27ae60', '#27ae60'
                ],
                borderWidth: 1
            }]
        },
        options: getChartOptions('Pontuação NPS', 'Número de respostas')
    });
}

function renderTrendChart(trends) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) {
        console.error('Canvas trendChart não encontrado');
        return;
    }
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: trends.map(t => t.date),
            datasets: [{
                label: 'Média diária',
                data: trends.map(t => t.average),
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: getChartOptions('Data', 'Pontuação média')
    });
}

function getChartOptions(xLabel, yLabel) {
    return {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                title: { display: true, text: yLabel }
            },
            x: {
                title: { display: true, text: xLabel }
            }
        }
    };
}