const autorService = require("../services/AutorService.js");
const { erroCatch, criarErro } = require("../utils/errorJornal.js");
const path = require("path");
const fs = require("fs");

class AutorController {
  async listarAutores(req, res) {
    try {
      const result = await autorService.listarAutores();
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async buscarAutor(req, res) {
    try {
      const result = await autorService.buscarAutor(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async cadastrarAutor(req, res) {
    try {
      const result = await autorService.cadastrarAutor(req.body);
      res.status(201).json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async atualizarAutor(req, res) {
    try {
      const result = await autorService.atualizarAutor(req.body, req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async deletarAutor(req, res) {
    try {
      const result = await autorService.deletarAutor(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async atualizarFotoPerfil(req, res) {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ mensagem: "Nenhum arquivo enviado" });
      }

      const usuario = await autorService.buscarAutor(id);

      if (!usuario) {
        if (req.file.path && !req.file.path.startsWith("http") && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }

      // Deleta a imagem antiga local se não for URL externa
      if (usuario.dados && usuario.dados.foto && !usuario.dados.foto.startsWith("http")) {
        const caminhoAntigo = path.join(__dirname, "../../", usuario.dados.foto);
        if (fs.existsSync(caminhoAntigo)) {
          fs.unlinkSync(caminhoAntigo);
        }
      }

      // Salva o caminho (URL do Cloudinary ou caminho relativo local)
      const novoCaminho = req.file.path.startsWith("http")
        ? req.file.path
        : `uploads/${id}/${req.file.filename}`;

      await autorService.atualizarAutor({ foto: novoCaminho }, id);
      const usuarioAtualizado = await autorService.buscarAutor(id);

      return res.status(200).json({
        sucesso: true,
        message: "Imagem de perfil atualizada com sucesso",
        imagePath: novoCaminho,
        dados: usuarioAtualizado.dados,
      });

    } catch (error) {
      if (req.file && req.file.path && !req.file.path.startsWith("http") && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      erroCatch(req, res, error);
    }
  }

  async deletarFotoPerfil(req, res) {
    try {
      const { id } = req.params;
      const usuario = await autorService.buscarAutor(id);

      if (!usuario) {
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }

      if (usuario.dados.foto) {
        if (!usuario.dados.foto.startsWith("http")) {
          const caminhoAntigo = path.join(__dirname, "../../", usuario.dados.foto);
          if (fs.existsSync(caminhoAntigo)) {
            fs.unlinkSync(caminhoAntigo);
          }
        }
        
        await autorService.atualizarAutor({ foto: null }, id);
        return res.status(200).json({ message: "Foto de perfil deletada com sucesso!" });
      }

      return res.status(400).json({ message: "O usuário não possui uma foto de perfil." });

    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async buscarDadosPessoais(req, res) {
    try {
      const result = await autorService.buscarDadosPessoais(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async atualizarDadosPessoais(req, res) {
    try {
      const result = await autorService.atualizarDadosPessoais(req.body, req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async buscarFotoPerfil(req, res) {
    try {
      const { id } = req.params;
      const usuario = await autorService.buscarAutor(id);

      if (!usuario || !usuario.dados) {
        return res.status(404).json({ error: "Usuário não encontrado!" });
      }

      if (usuario.dados.foto) {
        if (usuario.dados.foto.startsWith("http")) {
          return res.redirect(usuario.dados.foto);
        }

        const caminhoAbsoluto = path.join(__dirname, "..", "..", usuario.dados.foto);
        if (fs.existsSync(caminhoAbsoluto)) {
          return res.sendFile(caminhoAbsoluto);
        }
      }

      return res.status(404).json({ message: "Foto de perfil não encontrada no registro." });

    } catch (error) {
      erroCatch(req, res, error);
    }
  }
}

module.exports = new AutorController();
