function loadGoogleSheet(sheetId) {
  const container = document.getElementById('google-sheets-container');
  
  // Fallback 1: Link direto
  container.innerHTML = `
    <a href="https://docs.google.com/spreadsheets/d/${sheetId}/edit" target="_blank">
      Abrir planilha em nova guia
    </a>
    <p>Se a planilha não carregar acima, clique no link</p>
  `;
  
  // Tenta o iframe depois de 2 segundos
  setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?rm=minimal`;
    container.prepend(iframe);
  }, 2000);
}