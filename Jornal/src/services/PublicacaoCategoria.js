const publicacaoCategoriaRepository = require("../repositories/PublicacaoCategoria.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

class PublicacaoCategoriaService {
  async listarVinculos() {
    const vinculos = await publicacaoCategoriaRepository.listarVinculos();
    return {
      sucesso: true,
      dados: vinculos,
      total: vinculos.length,
    };
  }

  async buscarVinculo(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const vinculo = await publicacaoCategoriaRepository.buscarVinculo(id);
    if (!vinculo) {
      throw new Error("Vínculo publicação-categoria não encontrado. Status:404");
    }
    return {
      sucesso: true,
      dados: vinculo,
    };
  }

  async cadastrarVinculo(dados) {
    const { publicacao_id, categoria_id } = dados;
    if (!publicacao_id || !categoria_id) {
      throw new Error("Publicação e categoria são obrigatórios. Status:400");
    }
    const novo = {
      publicacao_id: Number(publicacao_id),
      categoria_id: Number(categoria_id),
    };
    const id = await publicacaoCategoriaRepository.cadastrarVinculo(novo);
    return {
      sucesso: true,
      mensagem: "Vínculo cadastrado com sucesso!",
      id,
    };
  }

  async atualizarVinculo(dados, id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await publicacaoCategoriaRepository.buscarVinculo(id);
    if (!existente) {
      throw new Error("Vínculo publicação-categoria não encontrado. Status:404");
    }
    const atualizado = {};
    if (dados.publicacao_id !== undefined) atualizado.publicacao_id = Number(dados.publicacao_id);
    if (dados.categoria_id !== undefined) atualizado.categoria_id = Number(dados.categoria_id);
    if (Object.keys(atualizado).length === 0) {
      throw new Error("Nenhuma alteração fornecida. Status:400");
    }
    await publicacaoCategoriaRepository.atualizarVinculo(atualizado, id);
    return {
      sucesso: true,
      mensagem: "Vínculo atualizado com sucesso!",
    };
  }

  async deletarVinculo(id) {
    if (!validarNumero(id)) {
      throw new Error("ID inválido. Status:400");
    }
    const existente = await publicacaoCategoriaRepository.buscarVinculo(id);
    if (!existente) {
      throw new Error("Vínculo publicação-categoria não encontrado. Status:404");
    }
    await publicacaoCategoriaRepository.deletarVinculo(id);
    return {
      sucesso: true,
      mensagem: "Vínculo deletado com sucesso!",
    };
  }
}

module.exports = new PublicacaoCategoriaService();
