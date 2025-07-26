const express = require('express');
const app = express();
const PORT = 3000;

// Importa os roteadores
const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

// --- Configuração do Swagger ---
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger.js'); // Importa nossa configuração
// Middleware para interpretar o corpo da requisição em JSON
app.use(express.json());
// Rota raiz apenas para verificar se o servidor está no ar
// --- Rotas da API ---
app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);

// --- Rota da Documentação ---
// A UI do Swagger será servida em /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Rota raiz apenas para verificar se o servidor está no ar
app.get('/', (req, res) => {
    res.send('API do Departamento de Polícia funcionando! Acesse /docs para ver a documentação.');
});


app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
    console.log(`Documentação da API disponível em http://localhost:${PORT}/docs`);
});