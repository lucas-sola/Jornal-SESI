const STORAGE_KEY = 'sesiUsuario'

document.addEventListener('DOMContentLoaded', function() {
    realizarLogin()
})

async function buscarAutorPorIdentificador(identificador) {
    const response = await fetch('/api/autores')
    const json = await response.json()
    const autores = json.dados || []
    const valor = identificador.toLowerCase()
    return autores.find((autor) =>
        autor.nome.toLowerCase() === valor || autor.email.toLowerCase() === valor
    )
}

function realizarLogin() {
    const formulario = document.querySelector('#formulario')
    const nome = document.querySelector('#nome')
    const senha = document.querySelector('#senha')
    const btn = formulario.querySelector('.btn-registro')

    formulario.addEventListener('submit', async (event) => {
        event.preventDefault()

        const nomeValor = nome.value.trim()
        const senhaValor = senha.value.trim()

        if (nomeValor === '' || senhaValor === '') {
            alert('Preencha todos os campos')
            return
        }

        const textoOriginal = btn.textContent
        btn.disabled = true
        btn.textContent = 'Entrando...'

        try {
            const autor = await buscarAutorPorIdentificador(nomeValor)

            if (autor) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    id: autor.id,
                    nome: autor.nome,
                    email: autor.email,
                }))
            } else {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    nome: nomeValor,
                }))
            }

            window.location.href = 'index.html'
        } catch (err) {
            alert('Erro ao fazer login. Tente novamente.')
            btn.disabled = false
            btn.textContent = textoOriginal
        }
    })
}