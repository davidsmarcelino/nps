// No início de renderDistributionChart ou renderTrendChart
const chartElement = document.getElementById('distributionChart'); // ou 'trendChart'

if (!window.chartObserver) {
    window.chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                renderChart();
                window.chartObserver.unobserve(entry.target);
            }
        });
    });
}

window.chartObserver.observe(chartElement);
function displayResults(responses) {
    if (!responses || responses.length === 0) {
        alert('Nenhum dado encontrado na planilha');
        return;
    }
    
    // Filtra respostas válidas (0-10)
    const validResponses = responses.filter(r => 
        !isNaN(r.score) && r.score >= 0 && r.score <= 10);
    
    calculateNps(validResponses);
    renderDistributionChart(validResponses);
    renderTrendChart(validResponses);
    displayComments(validResponses);
}

function calculateNps(responses) {
    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    const nps = ((promoters - detractors) / responses.length) * 100;
    
    document.getElementById('npsValue').textContent = Math.round(nps);
    
    const description = document.getElementById('npsDescription');
    description.innerHTML = `
        <div>Promotores: ${promoters} (${Math.round(promoters/responses.length*100)}%)</div>
        <div>Detratores: ${detractors} (${Math.round(detractors/responses.length*100)}%)</div>
        <div>Neutros: ${responses.length - promoters - detractors}</div>
    `;
    
    // Barra de NPS
    const npsBar = document.createElement('div');
    npsBar.style.height = '20px';
    npsBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #f39c12 50%, #2ecc71 100%)';
    npsBar.style.position = 'relative';
    npsBar.style.margin = '10px 0';
    
    const marker = document.createElement('div');
    marker.style.position = 'absolute';
    marker.style.left = `${(nps + 100) / 2}%`;
    marker.style.top = '-10px';
    marker.style.width = '2px';
    marker.style.height = '40px';
    marker.style.backgroundColor = 'black';
    
    npsBar.appendChild(marker);
    description.appendChild(npsBar);
}

function renderDistributionChart(responses) {
    const counts = Array(11).fill(0);
    responses.forEach(r => counts[r.score]++);
    
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    if (window.distributionChart) {
        window.distributionChart.data.datasets[0].data = counts;
        window.distributionChart.update();
    } else {
        window.distributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                datasets: [{
                    label: 'Número de respostas',
                    data: counts,
                    backgroundColor: [
                        '#e74c3c', '#e74c3c', '#e74c3c', 
                        '#f39c12', '#f39c12', '#f39c12', '#f39c12',
                        '#2ecc71', '#2ecc71', '#2ecc71', '#2ecc71'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de respostas'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Pontuação NPS'
                        }
                    }
                }
            }
        });
    }
}

function renderTrendChart(responses) {
    // Agrupa por data (simplificado)
    const byDate = {};
    responses.forEach(r => {
        const date = r.timestamp ? r.timestamp.split(' ')[0] : 'Sem data';
        if (!byDate[date]) {
            byDate[date] = { sum: 0, count: 0 };
        }
        byDate[date].sum += r.score;
        byDate[date].count++;
    });
    
    const labels = Object.keys(byDate).sort();
    const avgScores = labels.map(date => 
        byDate[date].sum / byDate[date].count);
    
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (window.trendChart) {
        window.trendChart.data.labels = labels;
        window.trendChart.data.datasets[0].data = avgScores;
        window.trendChart.update();
    } else {
        window.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Média diária',
                    data: avgScores,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 0,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Pontuação média'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Data'
                        }
                    }
                }
            }
        });
    }
}

function displayComments(responses) {
    const container = document.getElementById('commentsList');
    container.innerHTML = '';
    
    const comments = responses
        .filter(r => r.comment && r.comment.trim() !== '')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (comments.length === 0) {
        container.innerHTML = '<p>Nenhum comentário encontrado.</p>';
        return;
    }
    
    comments.forEach(r => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.innerHTML = `
            <div class="comment-header">
                <span class="comment-score">${r.score}/10</span>
                <span class="comment-date">${r.timestamp || 'Sem data'}</span>
            </div>
            <div class="comment-text">${r.comment}</div>
        `;
        container.appendChild(commentEl);
    });
}