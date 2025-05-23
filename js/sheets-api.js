// js/sheets-api.js
document.addEventListener('DOMContentLoaded', function() {
    function extractSheetId(url) {
        try {
            return new URL(url).pathname.split('/')[3];
        } catch {
            return url.match(/[a-zA-Z0-9-_]{44}/)?.[0];
        }
    }

    const btn = document.getElementById('loadData');
    if (btn) {
        btn.addEventListener('click', function() {
            const url = document.getElementById('sheetsUrl')?.value || '';
            const sheetId = extractSheetId(url);
            console.log('Extracted ID:', sheetId); // Debug
            if (sheetId) {
                window.location.href = `dashboard.html?sheetId=${sheetId}`;
            } else {
                alert('Link inválido!');
            }
        });
    }
});