const STORAGE_KEY = 'sesiUsuario'
const TOKEN_KEY = 'sesiToken'

document.addEventListener('DOMContentLoaded', function() {
    realizarLogin()
})

function realizarLogin() {
    const formulario = document.querySelector('#formulario')
    const nome = document.querySelector('#nome')
    const senha = document.querySelector('#senha')
    const btn = formulario.querySelector('.btn-registro')

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault()

        const identificadorValor = nome.value.trim()
        const senhaValor = senha.value.trim()

        if (identificadorValor === '' || senhaValor === '') {
            showToast('Preencha todos os campos.', 'warning')
            return
        }

        const textoOriginal = btn.textContent
        btn.disabled = true
        btn.textContent = 'Entrando...'

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identificador: identificadorValor,
                    senha: senhaValor,
                }),
            })

            const json = await response.json().catch(() => ({}))
            const mensagemApi = json.erro || json.mensagem || ''

            if (!response.ok || !json.sucesso) {
                // 401/403: e-mail ou senha incorretos; demais status: falha do servidor/banco
                if (response.status === 401 || response.status === 403) {
                    throw new Error(mensagemApi || 'Credenciais inválidas. Verifique seu e-mail/usuário e senha.')
                }
                throw new Error(mensagemApi || 'Erro do servidor. Tente novamente mais tarde.')
            }

            // Salva token JWT e perfil do usuário autenticado
            localStorage.setItem(TOKEN_KEY, json.token)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(json.usuario))

            showToast('Login realizado com sucesso!', 'success')

            setTimeout(() => {
                window.location.href = 'index.html'
            }, 800)
        } catch (err) {
            // Falhas de rede/servidor fora do ar (fetch rejeita) também recebem mensagem amigável
            const ehErroRede = err instanceof TypeError
            showToast(
                ehErroRede ? 'Erro do servidor. Tente novamente mais tarde.' : err.message,
                'error'
            )
            btn.disabled = false
            btn.textContent = textoOriginal
        }
    })
}