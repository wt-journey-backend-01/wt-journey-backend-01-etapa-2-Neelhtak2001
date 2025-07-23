const express = require('express');
const app = express();
const PORT = 3000;

// Importa os roteadores
const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

// Middleware para interpretar o corpo da requisição em JSON
app.use(express.json());
app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);


// Rota raiz apenas para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('API do Departamento de Polícia funcionando!');
});


app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
});