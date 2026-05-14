const statusEdicaoRepository = require("../repositories/StatusEdicao.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class StatusEdicaoService {
  async listarStatusEdicao() {
    const itens = await statusEdicaoRepository.listarStatusEdicao();
    return {
      sucesso: true,
      dados: itens,
      total: itens.length,
    };
  }

  async buscarStatusEdicao(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const item = await statusEdicaoRepository.buscarStatusEdicao(id);
    if (!item) {
      throw new Error("Status de edição não encontrado. Status:404");
    }
    return {
      sucesso: true,
      dados: item,
    };
  }

  async cadastrarStatusEdicao(dados) {
    const { nome } = dados;
    if (!nome) {
      throw new Error("Nome é obrigatório. Status:400");
    }
    const id = await statusEdicaoRepository.cadastrarStatusEdicao({ nome: nome.trim() });
    return {
      sucesso: true,
      mensagem: "Status de edição cadastrado com sucesso!",
      id,
    };
  }

  async atualizarStatusEdicao(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await statusEdicaoRepository.buscarStatusEdicao(id);
    if (!existente) {
      throw new Error("Status de edição não encontrado. Status:404");
    }
    if (!dados.nome) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await statusEdicaoRepository.atualizarStatusEdicao({ nome: dados.nome.trim() }, id);
    return {
      sucesso: true,
      mensagem: "Status de edição atualizado com sucesso!",
    };
  }

  async deletarStatusEdicao(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await statusEdicaoRepository.buscarStatusEdicao(id);
    if (!existente) {
      throw new Error("Status de edição não encontrado. Status:404");
    }
    await statusEdicaoRepository.deletarStatusEdicao(id);
    return {
      sucesso: true,
      mensagem: "Status de edição deletado com sucesso!",
    };
  }
}

module.exports = new StatusEdicaoService();
