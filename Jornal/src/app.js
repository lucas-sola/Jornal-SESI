const express = require("express");
const path = require("path");
const cors = require("cors");
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

// Serve os arquivos do front-end (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'view/Jornal-SESI-Final-main')));

// Serve a pasta de uploads como arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rota principal para carregar o index.html do front
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view/Jornal-SESI-Final-main/index.html'));
});

app.use('/api', routes); // Prefixo /api para organizar melhor

module.exports = app;

                                