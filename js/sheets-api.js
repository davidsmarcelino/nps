// sheets-api.js - Versão otimizada
document.getElementById('loadData').addEventListener('click', async function() {
    // Mostrar feedback visual imediato
    const btn = this;
    btn.disabled = true;
    btn.textContent = 'Carregando...';
    
    try {
        const url = document.getElementById('sheetsUrl').value.trim();
        const sheetId = extractSheetId(url);
        
        if (!sheetId) {
            alert('Link inválido. Cole um link do Google Sheets válido.');
            return;
        }

        // Usar setTimeout para liberar o thread principal
        setTimeout(async () => {
            await loadAndProcessSheetData(sheetId);
        }, 100);
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao processar a planilha');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Carregar Dados';
    }
});

async function loadAndProcessSheetData(sheetId) {
    // Adicionar indicador de carregamento
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
    
    try {
        const startTime = performance.now();
        
        // 1. Dividir o processamento em etapas
        const rawData = await fetchSheetData(sheetId);
        const parsedData = await parseDataInChunks(rawData);
        
        // 2. Atualizar a UI progressivamente
        updateNpsScore(parsedData);
        renderDistributionChart(parsedData);
        renderTrendChart(parsedData);
        
        console.log(`Processamento concluído em ${performance.now() - startTime}ms`);
    } finally {
        document.body.removeChild(loader);
    }
}

function fetchSheetData(sheetId) {
    return new Promise((resolve, reject) => {
        // Usar Web Workers se possível para operações pesadas
        if (window.Worker) {
            const worker = new Worker('js/sheets-worker.js');
            worker.postMessage({ sheetId });
            worker.onmessage = (e) => resolve(e.data);
            worker.onerror = reject;
        } else {
            // Fallback para requisição normal
            resolve(fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`));
        }
    });
}
// utilities.js
export function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

export function measurePerformance() {
    const measures = [];
    return {
        start(name) { measures[name] = performance.now(); },
        end(name) { 
            const duration = performance.now() - measures[name];
            console.log(`${name} took ${duration.toFixed(2)}ms`);
            return duration;
        }
    };
}
// [...] depois do código principal

// Utilitários
function debounce(func, timeout = 300) {
    // Implementação igual acima
}

function measurePerformance() {
    // Implementação igual acima
}