// js/charts.js - Versão atualizada

// Função para inicializar os gráficos com lazy loading
function initCharts() {
    const chartElements = [
        { id: 'distributionChart', type: 'bar' },
        { id: 'trendChart', type: 'line' }
    ];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chartId = entry.target.id;
                loadChartData(chartId);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    chartElements.forEach(chart => {
        const element = document.getElementById(chart.id);
        if (element) observer.observe(element);
    });
}

// Função para carregar dados e renderizar gráfico
async function loadChartData(chartId) {
    try {
        // Obtenha os dados da planilha ou de outra fonte
        const data = await fetchChartData(chartId);
        
        // Renderiza o gráfico específico
        switch(chartId) {
            case 'distributionChart':
                renderDistributionChart(data);
                break;
            case 'trendChart':
                renderTrendChart(data);
                break;
        }
    } catch (error) {
        console.error(`Erro ao carregar gráfico ${chartId}:`, error);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initCharts);