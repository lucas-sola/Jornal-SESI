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
      folder: "jornal-sesi/autores",
      allowed_formats: ["jpg", "jpeg", "png"],
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
    },
  });
} else {
  armazenamento = multer.diskStorage({
    destination: (req, file, callback) => {
      try {
        const pastaBase = path.join(__dirname, "..", "..", "uploads");
        const pastaFinal = path.join(pastaBase, String(req.params.id || "temp"));

        if (!fs.existsSync(pastaBase)) {
          fs.mkdirSync(pastaBase, { recursive: true });
        }

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
}

const filtroDeTipo = (req, file, callback) => {
  const tiposPermitidos = /jpg|jpeg|png/;
  const extensaoArquivoTestar = tiposPermitidos.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = tiposPermitidos.test(file.mimetype);

  if (mimetype && extensaoArquivoTestar) {
    return callback(null, true);
  } else {
    callback(new Error("Apenas imagens JPG ou PNG são permitidas"));
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
