const publicacaoRepository = require("../repositories/Publicacao.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class PublicacaoService {
  async listarPublicacoes() {
    const publicacoes = await publicacaoRepository.listarPublicacoes();
    return {
      sucesso: true,
      dados: publicacoes,
      total: publicacoes.length,
    };
  }

  async buscarPublicacao(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const publicacao = await publicacaoRepository.buscarPublicacao(id);
    if (!publicacao) {
      throw new Error("Publicação não encontrada. Status:404");
    }
    return {
      sucesso: true,
      dados: publicacao,
    };
  }

  async cadastrarPublicacao(dados) {
    const {
      titulo,
      data_criacao,
      autor_id,
      genero_id,
      tema_principal_id,
    } = dados;
    if (!titulo || !data_criacao || !autor_id || !genero_id || !tema_principal_id) {
      throw new Error(
        "Título, data de criação, autor, gênero e tema principal são obrigatórios. Status:400"
      );
    }
    const novo = {
      titulo: titulo.trim(),
      subtitulo: dados.subtitulo != null ? String(dados.subtitulo).trim() : null,
      conteudo: dados.conteudo != null ? dados.conteudo : null,
      resumo: dados.resumo != null ? dados.resumo : null,
      data_criacao,
      data_publicacao: dados.data_publicacao != null ? dados.data_publicacao : null,
      imagem_destaque: dados.imagem_destaque != null ? String(dados.imagem_destaque).trim() : null,
      visualizacoes: dados.visualizacoes !== undefined ? Number(dados.visualizacoes) : 0,
      destaque: dados.destaque !== undefined ? Boolean(dados.destaque) : false,
      autor_id: Number(autor_id),
      edicao_id: dados.edicao_id != null && dados.edicao_id !== "" ? Number(dados.edicao_id) : null,
      genero_id: Number(genero_id),
      tema_principal_id: Number(tema_principal_id),
    };
    const id = await publicacaoRepository.cadastrarPublicacao(novo);
    return {
      sucesso: true,
      mensagem: "Publicação cadastrada com sucesso!",
      id,
    };
  }

  async atualizarPublicacao(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await publicacaoRepository.buscarPublicacao(id);
    if (!existente) {
      throw new Error("Publicação não encontrada. Status:404");
    }
    const atualizado = {};
    if (dados.titulo) atualizado.titulo = dados.titulo.trim();
    if (dados.subtitulo !== undefined) atualizado.subtitulo = dados.subtitulo;
    if (dados.conteudo !== undefined) atualizado.conteudo = dados.conteudo;
    if (dados.resumo !== undefined) atualizado.resumo = dados.resumo;
    if (dados.data_criacao) atualizado.data_criacao = dados.data_criacao;
    if (dados.data_publicacao !== undefined) atualizado.data_publicacao = dados.data_publicacao;
    if (dados.imagem_destaque !== undefined) atualizado.imagem_destaque = dados.imagem_destaque;
    if (dados.visualizacoes !== undefined) atualizado.visualizacoes = Number(dados.visualizacoes);
    if (dados.destaque !== undefined) atualizado.destaque = Boolean(dados.destaque);
    if (dados.autor_id !== undefined) atualizado.autor_id = Number(dados.autor_id);
    if (dados.edicao_id !== undefined) {
      atualizado.edicao_id =
        dados.edicao_id === null || dados.edicao_id === "" ? null : Number(dados.edicao_id);
    }
    if (dados.genero_id !== undefined) atualizado.genero_id = Number(dados.genero_id);
    if (dados.tema_principal_id !== undefined) {
      atualizado.tema_principal_id = Number(dados.tema_principal_id);
    }
    if (Object.keys(atualizado).length === 0) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await publicacaoRepository.atualizarPublicacao(atualizado, id);
    return {
      sucesso: true,
      mensagem: "Publicação atualizada com sucesso!",
    };
  }

  async deletarPublicacao(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await publicacaoRepository.buscarPublicacao(id);
    if (!existente) {
      throw new Error("Publicação não encontrada. Status:404");
    }
    await publicacaoRepository.deletarPublicacao(id);
    return {
      sucesso: true,
      mensagem: "Publicação deletada com sucesso!",
    };
  }
}

module.exports = new PublicacaoService();
