// js/sheets-api.js
async function fetchSheetData(sheetId) {
    const range = 'Respostas ao formulário 1!A2:D'; // Inclui até a coluna D para capturar comentários
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&range=${encodeURIComponent(range)}`;
    console.log('Tentando acessar:', url);
    try {
        const response = await fetch(url, { method: 'GET', mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }
        const text = await response.text();
        console.log('Resposta bruta (completa):', text); // Log completo para depuração
        let jsonString = text.replace(/^\)\]\}'[\n\r]*/, '').trim();
        console.log('JSON após remover prefixo:', jsonString);
        if (!jsonString) {
            throw new Error('Resposta vazia após remover prefixo');
        }
        if (!jsonString.startsWith('{')) {
            throw new Error(`JSON não começa com '{'. Início do JSON: ${jsonString.slice(0, 50)}`);
        }
        const jsonData = JSON.parse(jsonString);
        console.log('JSON parseado com sucesso:', jsonData);
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
    
    console.log('Cabeçalhos encontrados:', headers); // Log dos cabeçalhos
    
    // Tenta identificar os índices com base em palavras-chave
    const dateIndex = headers.findIndex(h => h.toLowerCase().includes('carimbo') || h.toLowerCase().includes('timestamp') || h.toLowerCase().includes('data'));
    const scoreIndex = headers.findIndex(h => h.toLowerCase().includes('escala') || h.toLowerCase().includes('0 a 10') || h.toLowerCase().includes('pontuação') || h.toLowerCase().includes('score'));
    const commentIndex = headers.findIndex(h => h.toLowerCase().includes('comentário') || h.toLowerCase().includes('resposta') || h.toLowerCase().includes('feedback') || h.toLowerCase().includes('observação'));
    
    // Se algum índice não for encontrado, mapeia com base na posição
    const finalDateIndex = dateIndex !== -1 ? dateIndex : 0; // Assume coluna A para Data
    const finalScoreIndex = scoreIndex !== -1 ? scoreIndex : 1; // Assume coluna B para Pontuação
    const finalCommentIndex = commentIndex !== -1 ? commentIndex : 2; // Assume coluna C para Comentário
    
    console.log('Índices mapeados:', { dateIndex: finalDateIndex, scoreIndex: finalScoreIndex, commentIndex: finalCommentIndex });
    
    // Verifica se há colunas suficientes
    if (headers.length < 3) {
        throw new Error(`A planilha deve ter pelo menos 3 colunas (Data, Pontuação, Comentário). Colunas encontradas: ${headers.length}`);
    }
    
    const responses = rows.map(row => {
        const cells = row.c;
        return {
            score: cells[finalScoreIndex] ? parseInt(cells[finalScoreIndex].v) : 0,
            comment: cells[finalCommentIndex] ? cells[finalCommentIndex].v || '' : '',
            date: cells[finalDateIndex] ? cells[finalDateIndex].v : ''
        };
    });
    
    console.log('Respostas processadas:', responses); // Log das respostas processadas
    
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