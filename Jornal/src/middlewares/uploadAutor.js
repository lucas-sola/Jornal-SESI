const multer = require("multer");
const path = require("path");
const fs = require("fs");

const armazenamento = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      // Pega o caminho absoluto e normaliza para o Windows
      const pastaBase = path.resolve(process.cwd(), 'uploads');
      const pastaFinal = path.join(pastaBase, req.params.id);
      
      // Cria a pasta base se não existir
      if (!fs.existsSync(pastaBase)) {
        fs.mkdirSync(pastaBase, { recursive: true });
      }

      // Cria a pasta do autor se não existir
      if (!fs.existsSync(pastaFinal)) {
        fs.mkdirSync(pastaFinal, { recursive: true });
      }
      
      callback(null, pastaFinal);
    } catch (err) {
      callback(err);
    }
  },
  filename: (req, file, callback) => {
    const nomeUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extensaoArquivo = path.extname(file.originalname);
    callback(null, nomeUnico + extensaoArquivo);
  },
});

const filtroDeTipo = (req, file, callback) => {
  const tiposPermitidos = /jpg|jpeg|png/;
  const extensaoArquivoTestar = tiposPermitidos.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = tiposPermitidos.test(file.mimetype);

  if (mimetype && extensaoArquivoTestar) {
    return callback(null, true);
  } // arquivo permitido
  else {
    callback(new Error("apenas imagens sao permitidas"));
  }
};

const uploadFinal = multer({
  storage: armazenamento,
  fileFilter: filtroDeTipo,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = uploadFinal;
