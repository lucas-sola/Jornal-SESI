const autorRepository = require("../repositories/AutorRepository.js");
const autorService = require("./AutorService.js");
const { criarErro } = require("../utils/errorJornal.js");
const { compararHash, gerarHash, gerarTokenJWT, isAdminEmail } = require("../utils/authHelper.js");

class AuthService {
  async login(identificador, senha) {
    try {
      if (!identificador || !senha) {
        throw criarErro("Nome/E-mail e senha são obrigatórios", 400);
      }

      const idLimpo = identificador.trim().toLowerCase();
      const autor = await autorRepository.buscarPorIdentificador(idLimpo);

      if (!autor) {
        throw criarErro("Credenciais inválidas. Verifique seu e-mail/usuário e senha", 401);
      }

      // Se a senha ainda não foi migrada ou está nula, atualiza para o hash da senha fornecida
      if (!autor.senha) {
        const novoHash = await gerarHash(senha);
        await autorRepository.atualizarAutor({ senha: novoHash }, autor.id);
        autor.senha = novoHash;
      } else {
        const senhaCorreta = await compararHash(senha, autor.senha);
        if (!senhaCorreta) {
          throw criarErro("Credenciais inválidas. Verifique seu e-mail/usuário e senha", 401);
        }
      }

      // Garante que se o email for de admin, o cargo no banco/token seja 'admin'
      let cargo = autor.cargo || (isAdminEmail(autor.email) ? "admin" : "autor");
      if (isAdminEmail(autor.email) && autor.cargo !== "admin") {
        cargo = "admin";
        await autorRepository.atualizarAutor({ cargo: "admin" }, autor.id);
      }

      const payload = {
        id: autor.id,
        nome: autor.nome,
        email: autor.email,
        cargo,
        serie_escolar: autor.serie_escolar,
      };

      const token = gerarTokenJWT(payload);

      return {
        sucesso: true,
        mensagem: "Login realizado com sucesso!",
        token,
        usuario: {
          id: autor.id,
          nome: autor.nome,
          email: autor.email,
          cargo,
          serie_escolar: autor.serie_escolar,
          descricao: autor.descricao,
          area_interesse: autor.area_interesse,
          foto: autor.foto,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async registrar(dados) {
    try {
      const resultado = await autorService.cadastrarAutor(dados);
      const autor = await autorRepository.buscarAutor(resultado.id);

      const payload = {
        id: autor.id,
        nome: autor.nome,
        email: autor.email,
        cargo: autor.cargo,
        serie_escolar: autor.serie_escolar,
      };

      const token = gerarTokenJWT(payload);

      return {
        sucesso: true,
        mensagem: "Registro realizado com sucesso!",
        token,
        usuario: {
          id: autor.id,
          nome: autor.nome,
          email: autor.email,
          cargo: autor.cargo,
          serie_escolar: autor.serie_escolar,
          descricao: autor.descricao,
          area_interesse: autor.area_interesse,
          foto: autor.foto,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async me(id) {
    try {
      const resultado = await autorService.buscarAutor(id);
      return resultado;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
