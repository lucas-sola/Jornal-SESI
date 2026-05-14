const temaPrincipalRepository = require("../repositories/TemaPrincipal.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class TemaPrincipalService {
  async listarTemasPrincipais() {
    const itens = await temaPrincipalRepository.listarTemasPrincipais();
    return {
      sucesso: true,
      dados: itens,
      total: itens.length,
    };
  }

  async buscarTemaPrincipal(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const item = await temaPrincipalRepository.buscarTemaPrincipal(id);
    if (!item) {
      throw new Error("Tema principal não encontrado. Status:404");
    }
    return {
      sucesso: true,
      dados: item,
    };
  }

  async cadastrarTemaPrincipal(dados) {
    const { nome, descricao } = dados;
    if (!nome) {
      throw new Error("Nome é obrigatório. Status:400");
    }
    const novo = {
      nome: nome.trim(),
      descricao: descricao != null ? String(descricao).trim() : null,
    };
    const id = await temaPrincipalRepository.cadastrarTemaPrincipal(novo);
    return {
      sucesso: true,
      mensagem: "Tema principal cadastrado com sucesso!",
      id,
    };
  }

  async atualizarTemaPrincipal(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await temaPrincipalRepository.buscarTemaPrincipal(id);
    if (!existente) {
      throw new Error("Tema principal não encontrado. Status:404");
    }
    const atualizado = {};
    if (dados.nome) atualizado.nome = dados.nome.trim();
    if (dados.descricao !== undefined) atualizado.descricao = dados.descricao;
    if (Object.keys(atualizado).length === 0) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await temaPrincipalRepository.atualizarTemaPrincipal(atualizado, id);
    return {
      sucesso: true,
      mensagem: "Tema principal atualizado com sucesso!",
    };
  }

  async deletarTemaPrincipal(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await temaPrincipalRepository.buscarTemaPrincipal(id);
    if (!existente) {
      throw new Error("Tema principal não encontrado. Status:404");
    }
    await temaPrincipalRepository.deletarTemaPrincipal(id);
    return {
      sucesso: true,
      mensagem: "Tema principal deletado com sucesso!",
    };
  }
}

module.exports = new TemaPrincipalService();
