const categoriaRepository = require("../repositories/Categoria.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class CategoriaService {
  async listarCategorias() {
    const categorias = await categoriaRepository.listarCategorias();
    return {
      sucesso: true,
      dados: categorias,
      total: categorias.length,
    };
  }

  async buscarCategoria(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const categoria = await categoriaRepository.buscarCategoria(id);
    if (!categoria) {
      throw new Error("Categoria não encontrada. Status:404");
    }
    return {
      sucesso: true,
      dados: categoria,
    };
  }

  async cadastrarCategoria(dados) {
    const { sigla, nome, descricao } = dados;
    if (!sigla || !nome) {
      throw new Error("Sigla e nome são obrigatórios. Status:400");
    }
    const novo = {
      sigla: sigla.trim(),
      nome: nome.trim(),
      descricao: descricao != null ? String(descricao).trim() : null,
    };
    const id = await categoriaRepository.cadastrarCategoria(novo);
    return {
      sucesso: true,
      mensagem: "Categoria cadastrada com sucesso!",
      id,
    };
  }

  async atualizarCategoria(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await categoriaRepository.buscarCategoria(id);
    if (!existente) {
      throw new Error("Categoria não encontrada. Status:404");
    }
    const atualizado = {};
    if (dados.sigla) atualizado.sigla = dados.sigla.trim();
    if (dados.nome) atualizado.nome = dados.nome.trim();
    if (dados.descricao !== undefined) atualizado.descricao = dados.descricao;
    if (Object.keys(atualizado).length === 0) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await categoriaRepository.atualizarCategoria(atualizado, id);
    return {
      sucesso: true,
      mensagem: "Categoria atualizada com sucesso!",
    };
  }

  async deletarCategoria(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await categoriaRepository.buscarCategoria(id);
    if (!existente) {
      throw new Error("Categoria não encontrada. Status:404");
    }
    await categoriaRepository.deletarCategoria(id);
    return {
      sucesso: true,
      mensagem: "Categoria deletada com sucesso!",
    };
  }
}

module.exports = new CategoriaService();
