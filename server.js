const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Rota principal da aplicação
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint de simulação da API para status do sistema
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        adasSensors: 'Active',
        driverCert: true,
        humanSupportWaitTime: '< 1 min',
        co2SavedTotalKg: 14250
    });
});

app.listen(PORT, () => {
    console.log(`Servidor VerdeGO rodando na porta ${PORT}`);
});
