const STORAGE_KEY = 'sesiUsuario'
const TOKEN_KEY = 'sesiToken'

document.addEventListener('DOMContentLoaded', function () {
    mascararCPF('#cpf')
    mascararTelefone('#tel')
    iniciarUploadFoto()
    cadastroEfetuado()
})

function iniciarUploadFoto() {
    const input = document.querySelector('#foto-perfil')
    const btnSelecionar = document.querySelector('#btn-selecionar-foto')
    const btnRemover = document.querySelector('#btn-remover-foto')
    const previewImg = document.querySelector('#foto-preview-img')
    const placeholder = document.querySelector('.foto-placeholder')

    if (!input || !btnSelecionar) return

    btnSelecionar.addEventListener('click', () => input.click())

    input.addEventListener('change', () => {
        const file = input.files[0]
        if (!file) return

        if (!/^image\/(jpeg|jpg|png)$/.test(file.type)) {
            showToast('Apenas imagens JPG ou PNG são permitidas.', 'warning')
            input.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('A imagem deve ter no máximo 5MB.', 'warning')
            input.value = ''
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            previewImg.src = e.target.result
            previewImg.classList.remove('hidden')
            placeholder.classList.add('hidden')
            btnRemover.classList.remove('hidden')
        }
        reader.readAsDataURL(file)
    })

    btnRemover.addEventListener('click', () => {
        input.value = ''
        previewImg.src = ''
        previewImg.classList.add('hidden')
        placeholder.classList.remove('hidden')
        btnRemover.classList.add('hidden')
    })
}

async function registrarUsuario() {
    const nome = document.querySelector('#nome').value.trim()
    const cpf = document.querySelector('#cpf').value.trim()
    const email = document.querySelector('#email').value.trim()
    const tel = document.querySelector('#tel').value.trim()
    const senha = document.querySelector('#senha').value.trim()
    const fotoInput = document.querySelector('#foto-perfil')

    const response = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome,
            email,
            senha,
            serie_escolar: 'Não informado',
            cpf,
            telefone: tel,
        }),
    })

    const json = await response.json()

    if (!response.ok || !json.sucesso) {
        throw new Error(json.mensagem || json.erro || 'Erro ao criar conta. Verifique se o e-mail já está cadastrado.')
    }

    const autorId = json.usuario?.id || json.id
    const token = json.token

    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    }

    if (json.usuario) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json.usuario))
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: autorId, nome, email }))
    }

    if (fotoInput?.files?.[0] && autorId) {
        const formData = new FormData()
        formData.append('profileImage', fotoInput.files[0])

        const headers = {}
        if (token) headers['Authorization'] = `Bearer ${token}`

        const fotoRes = await fetch(`/api/autores/${autorId}/profile-image`, {
            method: 'POST',
            headers,
            body: formData,
        })

        if (!fotoRes.ok) {
            const fotoJson = await fotoRes.json()
            console.warn('Foto não enviada:', fotoJson.mensagem || fotoJson.erro)
        }
    }
}

function verificarCampos(){
    const nome = document.querySelector('#nome')
    const cpf = document.querySelector('#cpf')
    const email = document.querySelector('#email')
    const tel = document.querySelector('#tel')
    const senha = document.querySelector('#senha')

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
            validar: (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v)
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
            validar: (v) => /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(v)
        },
        {
            input: senha,
            mensagemVazio: 'Preencha a senha.',
            mensagemInvalido: 'A senha deve ter pelo menos 6 caracteres.',
            validar: (v) => v.length >= 6
        }
    ]

    let valido = true

    campos.forEach(({ input, mensagemVazio, mensagemInvalido, validar }) => {
        if (!input) return
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
        if (!input) return
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

    btnRegistro.addEventListener('click', async (event) =>{
        event.preventDefault()

        if (!verificarCampos()) return

        const textoOriginal = btnRegistro.innerHTML
        btnRegistro.disabled = true
        btnRegistro.textContent = 'Registrando...'

        try {
            await registrarUsuario()

            cards.forEach(card => {
                card.classList.toggle('hidden')
            })

            setTimeout(() => {
                window.location.href = 'index.html'
            }, 1500)
        } catch (err) {
            showToast(err.message || 'Erro ao registrar. Tente novamente.', 'error')
            btnRegistro.disabled = false
            btnRegistro.innerHTML = textoOriginal
        }
    })
}

function mascararCPF(seletor) {
    const input = document.querySelector(seletor)
    if (!input) return

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
    if (!input) return

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