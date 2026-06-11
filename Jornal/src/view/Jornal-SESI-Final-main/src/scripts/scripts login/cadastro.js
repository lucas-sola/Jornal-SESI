document.addEventListener('DOMContentLoaded', function () {
    mascararCPF('#cpf')
    mascararTelefone('#tel')
    cadastroEfetuado()
})

function verificarCampos(){
    const nome = document.querySelector('#nome')
    const cpf = document.querySelector('#cpf')
    const email = document.querySelector('#email')
    const tel = document.querySelector('#tel')

    const campos = [
        { 
            input: nome, 
            mensagemVazio: 'Preencha o nome completo.', 
            mensagemInvalido: 'O nome deve ter pelo menos 3 caracteres.',
            validar: (v) => v.length >= 3
        },
        { 
            input: cpf, 
            mensagemVazio: 'Preencha o CPF.', 
            mensagemInvalido: 'CPF incompleto. Digite os 11 números.',
            validar: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) // 000.000.000-00 = 14 caracteres com máscara
        },
        { 
            input: email, 
            mensagemVazio: 'Preencha o e-mail.', 
            mensagemInvalido: 'Digite um e-mail válido. Ex: nome@email.com',
            validar: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        },
        { 
            input: tel, 
            mensagemVazio: 'Preencha o telefone.', 
            mensagemInvalido: 'Telefone incompleto. Digite os 11 números.',
            validar: (v) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(v) // (00) 00000-0000 = 15 caracteres com máscara
        }
    ]

    let valido = true

    campos.forEach(({ input, mensagemVazio, mensagemInvalido, validar }) => {
        const field = input.closest('.field')
        const erroExistente = field.querySelector('.erro-msg')
        if (erroExistente) erroExistente.remove()
        input.classList.remove('input-erro')

        const valor = input.value.trim()
        let mensagemErro = ''

        if (!valor) {
            mensagemErro = mensagemVazio
        } else if (!validar(valor)) {
            mensagemErro = mensagemInvalido
        }

        if (mensagemErro) {
            valido = false
            input.classList.add('input-erro')

            const erro = document.createElement('span')
            erro.classList.add('erro-msg')
            erro.textContent = mensagemErro
            field.appendChild(erro)
        }
    })

    // Limpar erro ao digitar
    campos.forEach(({ input }) => {
        input.addEventListener('input', () => {
            const field = input.closest('.field')
            const erro = field.querySelector('.erro-msg')
            if (erro) erro.remove()
            input.classList.remove('input-erro')
        })
    })

    return valido
}

function cadastroEfetuado(){
    const cards = document.querySelectorAll('.card')
    const btnRegistro = document.querySelector('.btn-registro')

    btnRegistro.addEventListener('click', (event) =>{
        event.preventDefault()

        if (!verificarCampos()) return

        // Cadastro válido — prosseguir
        cards.forEach(card => {
            card.classList.toggle('hidden')
        })

        setTimeout(() =>{
            window.location.href = 'index.html'
        }, 1500)
    })

}

function mascararCPF(seletor) {
    const input = document.querySelector(seletor)

    input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '').slice(0, 11)

        if (valor.length > 9) {
            valor = valor.replace(
                /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
                '$1.$2.$3-$4'
            )
        } else if (valor.length > 6) {
            valor = valor.replace(
                /(\d{3})(\d{3})(\d{1,3})/,
                '$1.$2.$3'
            )
        } else if (valor.length > 3) {
            valor = valor.replace(
                /(\d{3})(\d{1,3})/,
                '$1.$2'
            )
        }

        input.value = valor
    })
}

function mascararTelefone(seletor) {
    const input = document.querySelector(seletor)

    input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '').slice(0, 11)

        if (valor.length > 10) {
            valor = valor.replace(
                /(\d{2})(\d{5})(\d{4})/,
                '($1) $2-$3'
            )
        } else if (valor.length > 6) {
            valor = valor.replace(
                /(\d{2})(\d{4,5})(\d{0,4})/,
                '($1) $2-$3'
            )
        } else if (valor.length > 2) {
            valor = valor.replace(
                /(\d{2})(\d+)/,
                '($1) $2'
            )
        }
        input.value = valor
    })
}