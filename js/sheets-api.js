// js/sheets-api.js
async function fetchSheetData(sheetId) {
    const range = 'Respostas ao formulário 1!A2:C'; // Ajuste conforme a aba real
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=${encodeURIComponent(range)}`;
    console.log('Tentando acessar:', url);
    try {
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Resposta bruta (completa):', text); // Log completo para depuração
        // Remover o prefixo ')]}' e quaisquer espaços antes do JSON
        const jsonString = text.replace(/^\)\]\}'/, '').trim();
        console.log('JSON extraído após remover prefixo:', jsonString); // Log do JSON extraído
        if (!jsonString) {
            throw new Error('Resposta vazia após remover prefixo');
        }
        const jsonData = JSON.parse(jsonString);
        if (jsonData.status === 'error') {
            throw new Error(jsonData.errors?.[0]?.detailed_message || 'Erro ao carregar dados da planilha');
        }
        console.log('JSON parseado com sucesso:', jsonData);
        return processSheetData(jsonData.table);
    } catch (error) {
        console.error('Erro em fetchSheetData:', error);
        throw new Error(`Falha ao buscar dados da planilha: ${error.message}`);
    }
}

function processSheetData(table) {
    const headers = table.cols.map(col => col.label || '');
    const rows = table.rows;
    
    console.log('Cabeçalhos encontrados:', headers); // Log dos cabeçalhos
    
    // Ajuste os índices conforme os cabeçalhos reais
    const scoreIndex = headers.findIndex(h => h.match(/\d+$/) || h.toLowerCase().includes('pontuação')); // Procura por números no final ou 'pontuação'
    const commentIndex = headers.findIndex(h => h.toLowerCase().includes('comentário') || h.toLowerCase().includes('resposta') || h.includes('escala')); // Ajuste para a coluna B
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('carimbo') || h.toLowerCase().includes('data'));
    
    if (scoreIndex === -1 || commentIndex === -1 || dateIndex === -1) {
        throw new Error(`Cabeçalhos esperados (Data, Comentário, Pontuação) não encontrados. Cabeçalhos encontrados: ${headers.join(', ')}`);
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