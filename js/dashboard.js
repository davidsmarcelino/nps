document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const sheetId = params.get('sheetId');
  
  if (!sheetId) {
    alert("Nenhuma planilha selecionada!");
    window.location.href = "index.html";
    return;
  }

  // 1. Carrega a planilha
  loadGoogleSheet(sheetId);
  
  // 2. Seus gráficos (mantenha seu código existente)
  initCharts(); 
});

function loadGoogleSheet(sheetId) {
  const container = document.getElementById('google-sheets-container');
  
  // Cria um iframe com o visualizador otimizado
  const iframe = document.createElement('iframe');
  iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal&widget=false&single=true`;
  iframe.style.width = '100%';
  iframe.style.height = '500px';
  iframe.style.border = 'none';
  iframe.loading = 'lazy';
  
  container.innerHTML = '';
  container.appendChild(iframe);
}