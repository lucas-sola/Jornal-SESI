const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");
const path = require("path");
const fs = require("fs");

const usarCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let armazenamento;

if (usarCloudinary) {
  armazenamento = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "jornal-sesi/publicacoes",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
    },
  });
} else {
  armazenamento = multer.diskStorage({
    destination: (req, file, callback) => {
      try {
        const autorId = req.usuario?.id || req.headers["x-usuario-id"] || "geral";
        const pastaBase = path.join(__dirname, "..", "..", "uploads", "publicacoes", String(autorId));

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
}

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
