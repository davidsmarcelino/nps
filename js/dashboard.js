// Carrega a planilha de forma segura
function embedSheet(sheetId) {
  const container = document.getElementById('sheet-embed');
  
  // Fallback para planilhas privadas
  const fallback = `
    <div class="sheet-fallback">
      <p>A visualização direta não está disponível.</p>
      <a href="https://docs.google.com/spreadsheets/d/${sheetId}/edit" target="_blank">
        Abrir planilha em nova guia
      </a>
    </div>
  `;

  // Tenta carregar como iframe
  const iframe = document.createElement('iframe');
  iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal&widget=false`;
  iframe.onload = () => container.classList.add('loaded');
  iframe.onerror = () => {
    container.innerHTML = fallback;
    container.classList.add('error');
  };
  
  container.innerHTML = '';
  container.appendChild(iframe);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const sheetId = params.get('sheetId');
  
  if (!sheetId) {
    document.getElementById('sheet-embed').innerHTML = 
      '<p class="error">Nenhuma planilha especificada</p>';
    return;
  }
  
  embedSheet(sheetId);
  initCharts(); // Sua função existente para gráficos
});