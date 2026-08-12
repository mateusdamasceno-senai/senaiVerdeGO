const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Define o caminho absoluto para a pasta 'public'
const publicPath = path.join(__dirname, 'public');

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(publicPath));

// Rota principal servindo o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Endpoint de simulação da API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        adasSensors: 'Active',
        driverCert: true,
        humanSupportWaitTime: '< 1 min',
        co2SavedTotalKg: 14250
    });
});

// Trata caso qualquer outra rota seja acessada e não encontre o arquivo
app.use((req, res) => {
    res.status(404).sendFile(path.join(publicPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor VerdeGO rodando na porta ${PORT}`);
});
