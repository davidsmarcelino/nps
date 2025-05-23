// js/sheets-api.js
async function fetchSheetData(sheetId, range) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=${range}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        // Extrair JSON da resposta (remover wrapper do Google Visualization)
        const jsonData = JSON.parse(text.replace(/^.*?\(/, '').replace(/\);$/, ''));
        
        if (jsonData.status === 'error') {
            throw new Error(jsonData.errors?.[0]?.detailed_message || 'Erro ao carregar dados da planilha');
        }

        return jsonData.table.rows;
    } catch (error) {
        console.error('Erro em fetchSheetData:', error);
        throw new Error(`Falha ao buscar dados da planilha: ${error.message}`);
    }
}

async function processData(sheetId, range, callback) {
    try {
        const rows = await fetchSheetData(sheetId, range);
        const data = rows.map(row => ({
            date: row.c[0]?.v || 'Desconhecido', // Coluna A: Data
            response: row.c[1]?.v || '', // Coluna B: Resposta
            score: row.c[2]?.v || 0 // Coluna C: Pontuação
        }));

        // Calcular NPS
        const nps = calculateNPS(data);
        callback(data, nps);
    } catch (error) {
        console.error('Erro em processData:', error);
        document.getElementById('errorMessage').textContent = `Erro ao processar dados: ${error.message}`;
        document.getElementById('errorMessage').style.display = 'block';
    }
}

function calculateNPS(data) {
    let promoters = 0, detractors = 0, total = data.length;
    data.forEach(item => {
        const score = item.score;
        if (typeof score === 'number') {
            if (score >= 9) promoters++;
            else if (score <= 6) detractors++;
        }
    });
    return total > 0 ? ((promoters / total) - (detractors / total)) * 100 : 0;
}