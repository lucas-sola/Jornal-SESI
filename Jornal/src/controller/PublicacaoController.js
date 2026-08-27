const publicacaoService = require("../services/PublicacaoService.js");
const { erroCatch } = require("../utils/errorJornal.js");
const fs = require("fs");

class PublicacaoController {
  async listarPublicacoes(req, res) {
    try {
      const result = await publicacaoService.listarPublicacoes();
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async buscarPublicacao(req, res) {
    try {
      const result = await publicacaoService.buscarPublicacao(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async cadastrarPublicacao(req, res) {
    try {
      const result = await publicacaoService.cadastrarPublicacao(req.body);
      res.status(201).json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async cadastrarPublicacaoAutor(req, res) {
    try {
      const { titulo, subtitulo, conteudo, genero_id, tema_principal_id, tags, destaque } = req.body;

      if (!titulo || !conteudo || !genero_id || !tema_principal_id) {
        return res.status(400).json({
          sucesso: false,
          erro: "Título, texto principal, gênero e tema são obrigatórios.",
        });
      }

      const hoje = new Date().toISOString().split("T")[0];
      const texto = String(conteudo).trim();
      const resumo = texto.length > 220 ? `${texto.substring(0, 220)}...` : texto;

      let imagem_destaque = null;
      if (req.file) {
        imagem_destaque = req.file.path.startsWith("http")
          ? req.file.path
          : `publicacoes/${req.autorId}/${req.file.filename}`;
      }

      const result = await publicacaoService.cadastrarPublicacao({
        titulo,
        subtitulo,
        conteudo: texto,
        resumo,
        data_criacao: hoje,
        data_publicacao: hoje,
        imagem_destaque,
        autor_id: req.autorId,
        genero_id,
        tema_principal_id,
        tags: tags || null,
        destaque: destaque === "true" || destaque === true,
      });

      res.status(201).json(result);
    } catch (error) {
      if (req.file?.path && !req.file.path.startsWith("http")) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      }
      erroCatch(req, res, error);
    }
  }

  async atualizarPublicacao(req, res) {
    try {
      const pub = await publicacaoService.buscarPublicacao(req.params.id);
      const ehAdmin = req.usuario?.cargo === "admin";

      if (pub.dados.autor_id !== req.autorId && !ehAdmin) {
        return res.status(403).json({
          sucesso: false,
          erro: "Você não tem permissão para alterar esta publicação.",
        });
      }

      const dadosAtualizacao = { ...req.body, editado: true };
      const result = await publicacaoService.atualizarPublicacao(dadosAtualizacao, req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }

  async deletarPublicacao(req, res) {
    try {
      const pub = await publicacaoService.buscarPublicacao(req.params.id);
      const ehAdmin = req.usuario?.cargo === "admin";

      if (pub.dados.autor_id !== req.autorId && !ehAdmin) {
        return res.status(403).json({
          sucesso: false,
          erro: "Você não tem permissão para excluir esta publicação.",
        });
      }
      const result = await publicacaoService.deletarPublicacao(req.params.id);
      res.json(result);
    } catch (error) {
      erroCatch(req, res, error);
    }
  }
}

module.exports = new PublicacaoController();
