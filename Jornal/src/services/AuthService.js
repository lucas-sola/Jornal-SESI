const autorRepository = require("../repositories/AutorRepository.js");
const autorService = require("./AutorService.js");
const { criarErro } = require("../utils/errorJornal.js");
const { compararHash, gerarHash, gerarTokenJWT, isAdminEmail, podePublicarPorEmail } = require("../utils/authHelper.js");

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

      // Autores oficiais (e-mail institucional) podem publicar; contas externas, só interagir
      const podePublicar =
        cargo === "admin" ||
        autor.pode_publicar === 1 ||
        autor.pode_publicar === true ||
        (!autor.pode_publicar && podePublicarPorEmail(autor.email));

      const payload = {
        id: autor.id,
        nome: autor.nome,
        email: autor.email,
        cargo,
        pode_publicar: podePublicar,
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
          pode_publicar: podePublicar,
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

      const podePublicar =
        autor.cargo === "admin" ||
        autor.pode_publicar === 1 ||
        autor.pode_publicar === true ||
        podePublicarPorEmail(autor.email);

      const payload = {
        id: autor.id,
        nome: autor.nome,
        email: autor.email,
        cargo: autor.cargo,
        pode_publicar: podePublicar,
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
          pode_publicar: podePublicar,
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

  async alterarSenha(id, dados) {
    const senhaAtual = typeof dados.senhaAtual === "string" ? dados.senhaAtual : "";
    const novaSenha = typeof dados.novaSenha === "string" ? dados.novaSenha : "";
    const confirmarSenha = typeof dados.confirmarSenha === "string" ? dados.confirmarSenha : "";

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      throw criarErro("Preencha a senha atual, a nova senha e a confirmação", 400);
    }
    if (novaSenha.length < 6) {
      throw criarErro("A nova senha deve ter ao menos 6 caracteres", 400);
    }
    if (novaSenha !== confirmarSenha) {
      throw criarErro("A confirmação da nova senha não confere", 400);
    }
    if (senhaAtual === novaSenha) {
      throw criarErro("A nova senha deve ser diferente da senha atual", 400);
    }

    const autor = await autorRepository.buscarAutor(id);
    if (!autor) {
      throw criarErro("Usuário não encontrado", 404);
    }
    if (!autor.senha || !(await compararHash(senhaAtual, autor.senha))) {
      throw criarErro("A senha atual está incorreta", 401);
    }

    await autorRepository.atualizarAutor({ senha: await gerarHash(novaSenha) }, autor.id);
    return { sucesso: true, mensagem: "Senha alterada com sucesso!" };
  }
}

module.exports = new AuthService();
