// js/dashboard.js
// Função principal que é executada quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    // Configura o botão de voltar
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

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
    if (!container) return;
    
    try {
        // Mostra loader enquanto carrega
        container.innerHTML = '<div class="loader"></div>';
        
        // Cria o iframe para visualização
        const iframe = document.createElement('iframe');
        iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal&widget=false&headers=false`;
        iframe.style.width = '100%';
        iframe.style.height = '500px';
        iframe.style.border = 'none';
        
        // Remove o loader quando o iframe carregar
        iframe.onload = () => {
            const loader = container.querySelector('.loader');
            if (loader) loader.style.display = 'none';
        };
        
        container.appendChild(iframe);
    } catch (error) {
        showError('Não foi possível carregar a planilha');
        console.error('Erro ao carregar planilha:', error);
    }
}

// Função para processar os dados e exibe os gráficos
async function processData(sheetId) {
    try {
        // Busca os dados da planilha
        const data = await fetchSheetData(sheetId);
        // Exibe os gráficos
        renderCharts(data);
    } catch (error) {
        showError(`Erro ao processar os dados: ${error.message}`);
        console.error('Erro ao processar dados:', error);
    }
}

// Função para exibir erros
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        console.error('Elemento errorMessage não encontrado');
    }
}