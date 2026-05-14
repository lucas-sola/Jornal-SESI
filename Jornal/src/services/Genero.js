const generoRepository = require("../repositories/Genero.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class GeneroService {
  async listarGeneros() {
    const generos = await generoRepository.listarGeneros();
    return {
      sucesso: true,
      dados: generos,
      total: generos.length,
    };
  }

  async buscarGenero(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const genero = await generoRepository.buscarGenero(id);
    if (!genero) {
      throw new Error("Gênero não encontrado. Status:404");
    }
    return {
      sucesso: true,
      dados: genero,
    };
  }

  async cadastrarGenero(dados) {
    const { nome, descricao } = dados;
    if (!nome) {
      throw new Error("Nome é obrigatório. Status:400");
    }
    const novo = {
      nome: nome.trim(),
      descricao: descricao != null ? String(descricao).trim() : null,
    };
    const id = await generoRepository.cadastrarGenero(novo);
    return {
      sucesso: true,
      mensagem: "Gênero cadastrado com sucesso!",
      id,
    };
  }

  async atualizarGenero(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await generoRepository.buscarGenero(id);
    if (!existente) {
      throw new Error("Gênero não encontrado. Status:404");
    }
    const atualizado = {};
    if (dados.nome) atualizado.nome = dados.nome.trim();
    if (dados.descricao !== undefined) atualizado.descricao = dados.descricao;
    if (Object.keys(atualizado).length === 0) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await generoRepository.atualizarGenero(atualizado, id);
    return {
      sucesso: true,
      mensagem: "Gênero atualizado com sucesso!",
    };
  }

  async deletarGenero(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await generoRepository.buscarGenero(id);
    if (!existente) {
      throw new Error("Gênero não encontrado. Status:404");
    }
    await generoRepository.deletarGenero(id);
    return {
      sucesso: true,
      mensagem: "Gênero deletado com sucesso!",
    };
  }
}

module.exports = new GeneroService();
