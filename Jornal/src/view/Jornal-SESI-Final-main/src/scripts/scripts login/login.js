document.addEventListener('DOMContentLoaded', function() {
    realizarLogin()
})

function realizarLogin() {
    const formulario = document.querySelector('#formulario')
    const nome = document.querySelector('#nome')
    const senha = document.querySelector('#senha')

    formulario.addEventListener('submit', (event) => {
        event.preventDefault()

        const nomeValor = nome.value.trim()
        const senhaValor = senha.value.trim()

        if (nomeValor === '' || senhaValor === '') {
            alert('Preencha todos os campos')
            return
        }

        setTimeout(() => {
            window.location.href = 'index.html'
        }, 1500)
    })
}