// js/dashboard.js

document.addEventListener('DOMContentLoaded', function() {
    // Extrai o parâmetro da URL
    const urlParams = new URLSearchParams(window.location.search);
    const sheetId = urlParams.get('sheetId');
    
    if (!sheetId) {
        alert('Nenhuma planilha especificada. Redirecionando...');
        window.location.href = 'index.html';
        return;
    }

    // Configura o iframe para visualização
    const iframe = document.getElementById('sheets-embed');
    iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal&widget=false&headers=false`;
    
    // Ajusta o tamanho do iframe
    function resizeIframe() {
        iframe.style.height = (window.innerHeight - 100) + 'px';
        iframe.style.width = '100%';
    }
    
    window.addEventListener('resize', resizeIframe);
    resizeIframe();
    
    // Carrega os dados para os gráficos (seu código existente)
    loadDataAndRenderCharts(sheetId);
});