const statusComentarioRepository = require("../repositories/StatusComentario.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class StatusComentarioService {
  async listarStatusComentario() {
    const itens = await statusComentarioRepository.listarStatusComentario();
    return {
      sucesso: true,
      dados: itens,
      total: itens.length,
    };
  }

  async buscarStatusComentario(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const item = await statusComentarioRepository.buscarStatusComentario(id);
    if (!item) {
      throw new Error("Status de comentário não encontrado. Status:404");
    }
    return {
      sucesso: true,
      dados: item,
    };
  }

  async cadastrarStatusComentario(dados) {
    const { nome } = dados;
    if (!nome) {
      throw new Error("Nome é obrigatório. Status:400");
    }
    const id = await statusComentarioRepository.cadastrarStatusComentario({ nome: nome.trim() });
    return {
      sucesso: true,
      mensagem: "Status de comentário cadastrado com sucesso!",
      id,
    };
  }

  async atualizarStatusComentario(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await statusComentarioRepository.buscarStatusComentario(id);
    if (!existente) {
      throw new Error("Status de comentário não encontrado. Status:404");
    }
    if (!dados.nome) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await statusComentarioRepository.atualizarStatusComentario({ nome: dados.nome.trim() }, id);
    return {
      sucesso: true,
      mensagem: "Status de comentário atualizado com sucesso!",
    };
  }

  async deletarStatusComentario(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await statusComentarioRepository.buscarStatusComentario(id);
    if (!existente) {
      throw new Error("Status de comentário não encontrado. Status:404");
    }
    await statusComentarioRepository.deletarStatusComentario(id);
    return {
      sucesso: true,
      mensagem: "Status de comentário deletado com sucesso!",
    };
  }
}

module.exports = new StatusComentarioService();
