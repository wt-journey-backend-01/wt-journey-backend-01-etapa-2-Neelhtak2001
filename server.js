const express = require('express');
const app = express();
const PORT = 3000;

// --- 1. Importações ---
// Roteadores da API
const agentesRouter = require('./routes/agentesRoutes');
const casosRouter = require('./routes/casosRoutes');

// Documentação com Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger.js'); // Seu arquivo de definição do Swagger

// Tratador de Erros
const errorHandler = require('./utils/errorHandler');


// --- 2. Middlewares Gerais ---
// Middleware para o Express entender JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. Definição das Rotas ---
// Rotas dos recursos da API
app.use('/agentes', agentesRouter);
app.use('/casos', casosRouter);

// Rota da documentação (Swagger)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz para um teste rápido
app.get('/', (req, res) => {
    res.send('API do Departamento de Polícia funcionando! Acesse /docs para ver a documentação.');
});


app.use(errorHandler);


// --- 5. Inicialização do Servidor ---
app.listen(PORT, () => {
    console.log(`Servidor do Departamento de Polícia rodando em http://localhost:${PORT}`);
    console.log(`Documentação disponível em http://localhost:${PORT}/docs`);
});