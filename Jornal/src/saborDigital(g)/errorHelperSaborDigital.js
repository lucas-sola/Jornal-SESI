function erroCatch(req, res, error) {
  res.status(error.status || 500).json({
    sucesso: false,
    mensagem: error.mensagem || "erro interno do servidor",
    erro: error.stack || error,
  });
}

module.exports = erroCatch;
