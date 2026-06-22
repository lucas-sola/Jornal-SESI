const multer = require("multer");
const path = require("path");
const fs = require("fs");

const armazenamento = multer.diskStorage({
  destination: (req, file, callback) => {
    try {
      const autorId = req.headers["x-usuario-id"] || "geral";
      const pastaBase = path.resolve(process.cwd(), "uploads", "publicacoes", String(autorId));

      if (!fs.existsSync(pastaBase)) {
        fs.mkdirSync(pastaBase, { recursive: true });
      }

      callback(null, pastaBase);
    } catch (err) {
      callback(err);
    }
  },
  filename: (req, file, callback) => {
    const nomeUnico = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extensao = path.extname(file.originalname);
    callback(null, nomeUnico + extensao);
  },
});

const filtroDeTipo = (req, file, callback) => {
  const tiposPermitidos = /jpg|jpeg|png|webp/;
  const extensaoValida = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimetypeValido = tiposPermitidos.test(file.mimetype);

  if (extensaoValida && mimetypeValido) {
    return callback(null, true);
  }

  callback(new Error("Apenas imagens JPG, PNG ou WEBP são permitidas"));
};

module.exports = multer({
  storage: armazenamento,
  fileFilter: filtroDeTipo,
  limits: { fileSize: 8 * 1024 * 1024 },
});
