// js/sheets-api.js
async function fetchSheetData(sheetId) {
    const range = 'Respostas!A2:C'; // Ajuste conforme a aba e intervalo da sua planilha
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=${encodeURIComponent(range)}`;
    console.log('Tentando acessar:', url); // Log para depuração
    try {
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Resposta bruta:', text); // Log para depuração
        // Extrair o JSON de forma robusta
        const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
        if (!jsonMatch || !jsonMatch[1]) {
            throw new Error('Formato de resposta inválido');
        }
        const jsonData = JSON.parse(jsonMatch[1]);
        if (jsonData.status === 'error') {
            throw new Error(jsonData.errors?.[0]?.detailed_message || 'Erro ao carregar dados da planilha');
        }
        return processSheetData(jsonData.table);
    } catch (error) {
        console.error('Erro em fetchSheetData:', error);
        throw new Error(`Falha ao buscar dados da planilha: ${error.message}`);
    }
}

function processSheetData(table) {
    const headers = table.cols.map(col => col.label || '');
    const rows = table.rows;
    
    // Encontra os índices das colunas relevantes
    const scoreIndex = headers.findIndex(h => h.toLowerCase().includes('pontuação') || h.toLowerCase().includes('score'));
    const commentIndex = headers.findIndex(h => h.toLowerCase().includes('comentário') || h.toLowerCase().includes('comment'));
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('data') || h.toLowerCase().includes('date') || h.toLowerCase().includes('timestamp'));
    
    if (scoreIndex === -1 || commentIndex === -1 || dateIndex === -1) {
        throw new Error('Cabeçalhos esperados (Data, Comentário, Pontuação) não encontrados');
    }
    
    const responses = rows.map(row => {
        const cells = row.c;
        return {
            score: cells[scoreIndex] ? parseInt(cells[scoreIndex].v) : 0,
            comment: cells[commentIndex] ? cells[commentIndex].v : '',
            date: cells[dateIndex] ? cells[dateIndex].v : ''
        };
    });
    
    return {
        responses,
        nps: calculateNPS(responses),
        distribution: calculateDistribution(responses),
        trends: calculateTrends(responses),
        comments: responses.filter(r => r.comment.trim() !== '')
    };
}

function calculateNPS(responses) {
    const promoters = responses.filter(r => r.score >= 9).length;
    const detractors = responses.filter(r => r.score <= 6).length;
    const total = responses.length;
    return total > 0 ? ((promoters - detractors) / total) * 100 : 0;
}

function calculateDistribution(responses) {
    const distribution = Array(11).fill(0);
    responses.forEach(r => distribution[r.score]++);
    return distribution;
}

function calculateTrends(responses) {
    const byDate = {};
    responses.forEach(r => {
        const date = r.date || 'Sem data';
        if (!byDate[date]) {
            byDate[date] = { sum: 0, count: 0 };
        }
        byDate[date].sum += r.score;
        byDate[date].count++;
    });
    
    return Object.keys(byDate).map(date => ({
        date,
        average: byDate[date].sum / byDate[date].count || 0
    }));
}