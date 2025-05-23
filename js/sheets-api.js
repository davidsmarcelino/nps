// Verifica se o DOM está completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    const loadBtn = document.getElementById('loadData');
    const urlInput = document.getElementById('sheetsUrl');
    
    // Verifica se os elementos existem antes de continuar
    if (!loadBtn || !urlInput) {
        console.error('Elementos não encontrados no DOM');
        return;
    }

    loadBtn.addEventListener('click', async function() {
        const btn = this;
        try {
            btn.disabled = true;
            btn.textContent = 'Carregando...';
            
            const url = urlInput.value.trim();
            
            if (!url) {
                alert('Por favor, cole o link da planilha');
                return;
            }

            const sheetId = extractSheetId(url);
            if (!sheetId) {
                alert('Link inválido. Use um link do Google Sheets válido.');
                return;
            }

            window.location.href = `dashboard.html?sheetId=${sheetId}&embed=true`;
            
        } catch (error) {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao processar o link');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Carregar Dados';
        }
    });
});

// Função para extrair ID da planilha (certifique-se que está declarada)
function extractSheetId(url) {
    if (!url) return null;
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