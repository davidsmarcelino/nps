// sheets-api.js - Versão para GitHub Pages
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('loadData');
    if (loadBtn) {
        loadBtn.addEventListener('click', function() {
            // Simulação de dados para demonstração (substitua pelo seu código real)
            alert("No GitHub Pages, você precisa usar uma solução alternativa. Veja as opções abaixo.");
            
            // Alternativa 1: Usar uma planilha pública via API (requer configuração adicional)
            // const url = document.getElementById('sheetsUrl').value.trim();
            // const sheetId = extractSheetId(url);
            // if (sheetId) {
            //     window.location.href = `dashboard.html?sheetId=${sheetId}`;
            // }
        });
    }
});

// Função para extrair ID da planilha (mantenha essa função)
function extractSheetId(url) {
    const regex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}