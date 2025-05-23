// Função principal que é executada quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Configura o botão de voltar
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Extrai o ID da planilha da URL
    const urlParams = new URLSearchParams(window.location.search);
    const sheetId = urlParams.get('sheetId');
    
    if (!sheetId) {
        showError('Nenhuma planilha foi especificada');
        return;
    }

    // Carrega e exibe a planilha
    loadSheet(sheetId);
    
    // Processa os dados e exibe os gráficos
    processData(sheetId);
});

// Função para carregar a planilha do Google Sheets
async function loadSheet(sheetId) {
    const container = document.getElementById('sheet-container');
    
    try {
        // Cria o iframe para visualização
        const iframe = document.createElement('iframe');
        iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal&widget=false&headers=false`;
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        // Remove o loader quando o iframe carregar
        iframe.onload = () => {
            container.querySelector('.loader').style.display = 'none';
        };
        
        container.appendChild(iframe);
        
    } catch (error) {
        showError('Não foi possível carregar a planilha');
        console.error('Erro ao carregar planilha:', error);
    }
}

// Função para processar os dados e exibir gráficos
async function processData(sheetId) {
    try {
        // Busca os dados da planilha via API
        const data = await fetchSheetData(sheetId);
        
        // Exibe os gráficos
        renderCharts(data);
        
        // Exibe os comentários
        renderComments(data.comments);
        
    } catch (error) {
        showError('Erro ao processar os dados');
        console.error('Erro ao processar dados:', error);
    }
}

// Função para buscar dados da planilha
async function fetchSheetData(sheetId) {
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        return processSheetData(json.table);
    } catch (error) {
        throw new Error('Falha ao buscar dados da planilha');
    }
}

// Função para processar os dados da planilha
function processSheetData(table) {
    const headers = table.cols.map(col => col.label);
    const rows = table.rows;
    
    // Encontra os índices das colunas relevantes
    const scoreIndex = headers.findIndex(h => h.toLowerCase().includes('score') || h.includes('pontuação'));
    const commentIndex = headers.findIndex(h => h.toLowerCase().includes('comment') || h.includes('comentário'));
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date') || h.includes('data'));
    
    // Processa as respostas
    const responses = rows.map(row => {
        const cells = row.c;
        return {
            score: cells[scoreIndex] ? parseInt(cells[scoreIndex].v) : 0,
            comment: cells[commentIndex] ? cells[commentIndex].v : '',
            date: cells[dateIndex] ? cells[dateIndex].v : ''
        };
    });
    
    return {
        responses,
        nps: calculateNPS(responses),
        distribution: calculateDistribution(responses),
        trends: calculateTrends(responses),
        comments: responses.filter(r => r.comment.trim() !== '')
    };
}

// Funções auxiliares para cálculos
function calculateNPS(responses) {
    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    return ((promoters - detractors) / responses.length) * 100;
}

function calculateDistribution(responses) {
    const distribution = Array(11).fill(0);
    responses.forEach(r => distribution[r.score]++);
    return distribution;
}

function calculateTrends(responses) {
    // Agrupa por data (implementação simplificada)
    const byDate = {};
    responses.forEach(r => {
        const date = r.date || 'Sem data';
        if (!byDate[date]) {
            byDate[date] = { sum: 0, count: 0 };
        }
        byDate[date].sum += r.score;
        byDate[date].count++;
    });
    
    return Object.keys(byDate).map(date => ({
        date,
        average: byDate[date].sum / byDate[date].count
    }));
}

// Funções para renderização
function renderCharts(data) {
    renderDistributionChart(data.distribution);
    renderTrendChart(data.trends);
    renderNPS(data.nps);
}

function renderDistributionChart(distribution) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    new Chart(ctx, {
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
                borderWidth: 1
            }]
        },
        options: chartOptions('Pontuação NPS', 'Número de respostas')
    });
}

function renderTrendChart(trends) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    new Chart(ctx, {
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
        options: chartOptions('Data', 'Pontuação média')
    });
}

function chartOptions(xLabel, yLabel) {
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

function renderComments(comments) {
    const container = document.getElementById('comments-container');
    
    if (comments.length === 0) {
        container.innerHTML = '<p>Nenhum comentário encontrado.</p>';
        return;
    }
    
    container.innerHTML = comments.map(c => `
        <div class="comment">
            <div class="comment-header">
                <span class="score">${c.score}/10</span>
                <span class="date">${c.date || 'Sem data'}</span>
            </div>
            <div class="comment-text">${c.comment}</div>
        </div>
    `).join('');
}

function showError(message) {
    const container = document.getElementById('sheet-container');
    container.innerHTML = `<div class="error">${message}</div>`;
}