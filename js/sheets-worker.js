// sheets-worker.js
self.onmessage = async function(e) {
    const { sheetId } = e.data;
    
    try {
        const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        // Processar dados em chunks
        const result = [];
        const chunkSize = 100;
        
        for (let i = 0; i < json.table.rows.length; i += chunkSize) {
            const chunk = json.table.rows.slice(i, i + chunkSize);
            result.push(...processChunk(chunk));
            self.postMessage({ progress: i / json.table.rows.length });
        }
        
        self.postMessage({ data: result });
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};

function processChunk(chunk) {
    return chunk.map(row => ({
        timestamp: row.c[0]?.v || '',
        score: parseInt(row.c[1]?.v || 0),
        comment: row.c[2]?.v || ''
    }));
}