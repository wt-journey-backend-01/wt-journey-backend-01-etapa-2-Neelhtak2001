// utils/errorHandler.js

//middleware de tratamento de erros do Express.
function errorHandler(err, req, res, next) {
  console.error(err.stack); // Loga o erro no console para o desenvolvedor ver

  // Envia uma resposta de erro genérica para o cliente
  res.status(500).json({
    status: 500,
    message: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.'
  });
}

module.exports = errorHandler;