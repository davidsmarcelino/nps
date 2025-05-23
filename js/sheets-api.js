// js/sheets-api.js - Versão com validação completa

function extractSheetId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Padrões para extrair o ID
    const patterns = [
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
        /^([a-zA-Z0-9-_]+)$/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

document.getElementById('loadData').addEventListener('click', async function() {
    const btn = this;
    const urlInput = document.getElementById('sheetsUrl');
    
    try {
        // Validação inicial
        if (!urlInput.value.trim()) {
            alert('Por favor, cole o link da planilha antes de carregar');
            return;
        }
        
        btn.disabled = true;
        btn.textContent = 'Carregando...';
        
        const sheetId = extractSheetId(urlInput.value.trim());
        
        // Validação do ID
        if (!sheetId) {
            alert('Link inválido. Certifique-se de usar um link do Google Sheets válido.');
            return;
        }
        
        // Mostrar loading
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Processando planilha...';
        document.body.appendChild(loadingIndicator);
        
        // Processamento (simulado com timeout para demonstração)
        setTimeout(() => {
            window.location.href = `dashboard.html?sheetId=${sheetId}&embed=true`;
            document.body.removeChild(loadingIndicator);
        }, 1000);
        
    } catch (error) {
        console.error('Erro detalhado:', error);
        alert('Erro ao processar: ' + (error.message || 'Verifique o console para detalhes'));
    } finally {
        btn.disabled = false;
        btn.textContent = 'Carregar Dados';
    }
});