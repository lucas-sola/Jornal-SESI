const autorRepository = require("../repositories/AutorRepository.js");
const { criarErro } = require("../utils/errorJornal.js");
const { gerarHash, isAdminEmail } = require("../utils/authHelper.js");

function validarNumero(id) {
  return id && !isNaN(id) && Number(id) > 0;
}

function sanitizarAutorPublico(autor) {
  if (!autor) return autor;
  const { senha, cpf, telefone, ...publico } = autor;
  return publico;
}

class AutorService {
  async listarAutores() {
    try {
      const autores = await autorRepository.listarAutores();
      return {
        sucesso: true,
        dados: autores.map(sanitizarAutorPublico),
        total: autores.length,
      };
    } catch (error) { throw error; }
  }

  async buscarAutor(id, incluirPrivado = false) {
    try {
      if (!validarNumero(id)) throw criarErro("ID inválido", 400);
      const autor = await autorRepository.buscarAutor(id);
      if (!autor) throw criarErro("Autor não encontrado", 404);
      
      if (incluirPrivado) {
        const { senha, ...autorSemSenha } = autor;
        return { sucesso: true, dados: autorSemSenha };
      }
      return {
        sucesso: true,
        dados: sanitizarAutorPublico(autor),
      };
    } catch (error) { throw error; }
  }

  async buscarDadosPessoais(id) {
    try {
      if (!validarNumero(id)) throw criarErro("ID inválido", 400);
      const autor = await autorRepository.buscarAutor(id);
      if (!autor) throw criarErro("Autor não encontrado", 404);
      return {
        sucesso: true,
        dados: {
          cpf: autor.cpf || "",
          telefone: autor.telefone || "",
        },
      };
    } catch (error) { throw error; }
  }

  async cadastrarAutor(dados) {
    try {
      const { nome, serie_escolar, email, senha, descricao, area_interesse, cpf, telefone, cargo } = dados;
      if (!nome || !email) {
        throw criarErro("Nome e e-mail são obrigatórios", 400);
      }

      const emailTrim = email.trim().toLowerCase();
      const autorExistente = await autorRepository.buscarPorEmail(emailTrim);
      if (autorExistente) {
        throw criarErro("Este e-mail já está cadastrado", 409);
      }

      const senhaPlana = senha || "123456";
      const senhaHash = await gerarHash(senhaPlana);
      const ehAdmin = isAdminEmail(emailTrim) || cargo === "admin";

      const novoAutor = {
        nome: nome.trim(),
        serie_escolar: serie_escolar ? serie_escolar.trim() : "Não informado",
        email: emailTrim,
        senha: senhaHash,
        cargo: ehAdmin ? "admin" : "autor",
        descricao: descricao ? descricao.trim() : null,
        area_interesse: area_interesse ? area_interesse.trim() : null,
        cpf: cpf ? cpf.trim() : null,
        telefone: telefone ? telefone.trim() : null,
        ativo: 1,
      };

      const id = await autorRepository.cadastrarAutor(novoAutor);
      return {
        sucesso: true,
        mensagem: "Autor cadastrado com sucesso!",
        id,
        cargo: novoAutor.cargo,
      };
    } catch (error) { throw error; }
  }

  async atualizarAutor(dados, id) {
    try {
      if (!validarNumero(id)) throw criarErro("ID inválido", 400);
      const autorExistente = await autorRepository.buscarAutor(id);
      if (!autorExistente) throw criarErro("Autor não encontrado", 404);
      
      const autorAtualizado = {};
      if (dados.nome) autorAtualizado.nome = dados.nome.trim();
      if (dados.serie_escolar) autorAtualizado.serie_escolar = dados.serie_escolar.trim();
      if (dados.email) {
        const emailTrim = dados.email.trim().toLowerCase();
        autorAtualizado.email = emailTrim;
        if (isAdminEmail(emailTrim)) {
          autorAtualizado.cargo = "admin";
        }
      }
      if (dados.senha) {
        autorAtualizado.senha = await gerarHash(dados.senha);
      }
      if (dados.cargo && ["admin", "autor"].includes(dados.cargo)) {
        autorAtualizado.cargo = dados.cargo;
      }
      if (dados.descricao !== undefined) autorAtualizado.descricao = dados.descricao;
      if (dados.area_interesse !== undefined) autorAtualizado.area_interesse = dados.area_interesse;
      if (dados.foto !== undefined) autorAtualizado.foto = dados.foto;
      
      if (Object.keys(autorAtualizado).length === 0) throw criarErro("Nenhuma alteração fornecida", 400);
      await autorRepository.atualizarAutor(autorAtualizado, id);
      return { sucesso: true, mensagem: "Autor atualizado com sucesso!" };
    } catch (error) { throw error; }
  }

  async atualizarDadosPessoais(dados, id) {
    try {
      if (!validarNumero(id)) throw criarErro("ID inválido", 400);
      const autorExistente = await autorRepository.buscarAutor(id);
      if (!autorExistente) throw criarErro("Autor não encontrado", 404);

      const atualizado = {};
      if (dados.cpf !== undefined) atualizado.cpf = dados.cpf ? dados.cpf.trim() : null;
      if (dados.telefone !== undefined) atualizado.telefone = dados.telefone ? dados.telefone.trim() : null;

      if (Object.keys(atualizado).length === 0) {
        throw criarErro("Nenhuma alteração fornecida", 400);
      }

      await autorRepository.atualizarAutor(atualizado, id);
      return { sucesso: true, mensagem: "Informações pessoais atualizadas com sucesso!" };
    } catch (error) { throw error; }
  }

  async deletarAutor(id) {
    try {
      if (!validarNumero(id)) throw criarErro("ID inválido", 400);
      const autorExistente = await autorRepository.buscarAutor(id);
      if (!autorExistente) throw criarErro("Autor não encontrado", 404);
      await autorRepository.deletarAutor(id);
      return { sucesso: true, mensagem: "Autor deletado com sucesso!" };
    } catch (error) { throw error; }
  }
}

module.exports = new AutorService();
