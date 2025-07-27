// utils/errorHandler.js

function errorHandler(err, req, res, next) {
  // Loga o erro completo no console para fins de depuração.
  console.error(err);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 400,
      message: 'JSON mal formatado no corpo da requisição.'
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 400,
      message: 'Dados inválidos no payload.',
      errors: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensagem: e.message
      }))
    });
  }

  res.status(500).json({
    status: 500,
    message: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.'
  });
}

module.exports = errorHandler;