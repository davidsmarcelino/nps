// js/sheets-api.js - Versão completa

// 1. Função para extrair ID da planilha (DEVE estar no topo)
function extractSheetId(url) {
    if (!url) return null;
    
    // Suporta vários formatos de URL
    const patterns = [
        /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,  // URL completo
        /^([a-zA-Z0-9-_]+)$/                     // Somente ID
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    
    return null;
}

// 2. Event listener principal (DEVE vir depois da função)
document.getElementById('loadData').addEventListener('click', async function() {
    const btn = this;
    try {
        btn.disabled = true;
        btn.textContent = 'Carregando...';
        
        const url = document.getElementById('sheetsUrl').value.trim();
        const sheetId = extractSheetId(url); // Agora a função existe
        
        if (!sheetId) {
            alert('Link inválido. Cole um link do Google Sheets válido.');
            return;
        }
        
        // Redirecionar para a dashboard com o ID
        window.location.href = `dashboard.html?sheetId=${sheetId}`;
        
    } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao processar o link');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Carregar Dados';
    }
});