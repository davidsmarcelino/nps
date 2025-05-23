// js/charts.js
function renderChart(data, nps) {
    const ctx = document.getElementById('npsChart').getContext('2d');
    if (!ctx) {
        console.error('Canvas npsChart não encontrado');
        return;
    }

    const labels = data.map(item => item.date);
    const scores = data.map(item => item.score);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pontuação NPS',
                data: scores,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Pontuação' } },
                x: { title: { display: true, text: 'Data' } }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: `NPS Calculado: ${nps.toFixed(2)}` }
            }
        }
    });
}