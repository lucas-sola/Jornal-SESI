const STORAGE_KEY = 'sesiUsuario'

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = obterUsuarioLogado()
    if (!usuario?.id) {
        window.location.href = 'login.html'
        return
    }

    mascararCPF('#cpf')
    mascararTelefone('#tel')
    iniciarUploadAvatar()
    await carregarPerfil(usuario.id)
    await carregarDadosPessoais(usuario.id)
    configurarFormulario(usuario.id)
    configurarSair()
})

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch {
        return null
    }
}

function headersPrivados(autorId) {
    return {
        'Content-Type': 'application/json',
        'X-Usuario-Id': String(autorId),
    }
}

function iniciarUploadAvatar() {
    const input = document.getElementById('avatar-input')
    const triggers = [
        document.getElementById('btn-upload-desktop'),
        document.getElementById('btn-upload-mobile'),
        document.getElementById('txt-upload-desktop'),
        document.getElementById('txt-upload-mobile'),
    ].filter(Boolean)

    triggers.forEach((el) => {
        el.addEventListener('click', () => input.click())
    })

    input.addEventListener('change', () => {
        const file = input.files[0]
        if (!file) return

        if (!/^image\/(jpeg|jpg|png)$/.test(file.type)) {
            alert('Apenas imagens JPG ou PNG são permitidas.')
            input.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.')
            input.value = ''
            return
        }

        previewAvatar(file)
    })
}

function previewAvatar(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
        mostrarAvatar(e.target.result)
    }
    reader.readAsDataURL(file)
}

function mostrarAvatar(url) {
    ;['avatar-image-desktop', 'avatar-image-mobile'].forEach((id) => {
        const img = document.getElementById(id)
        if (img) {
            img.src = url
            img.classList.remove('hidden')
            // Se a foto não carregar (arquivo removido do servidor), volta a mostrar o ícone padrão
            img.onerror = () => {
                img.classList.add('hidden')
                const placeholderId = id.replace('avatar-image-', 'avatar-placeholder-')
                const placeholder = document.getElementById(placeholderId)
                if (placeholder) placeholder.classList.remove('hidden')
            }
        }
    })

    ;['avatar-placeholder-desktop', 'avatar-placeholder-mobile'].forEach((id) => {
        const svg = document.getElementById(id)
        if (svg) svg.classList.add('hidden')
    })
}

async function carregarPerfil(autorId) {
    try {
        const response = await fetch(`/api/autores/${autorId}`)
        const json = await response.json()

        if (!json.sucesso || !json.dados) return

        const autor = json.dados

        document.getElementById('full_name').value = autor.nome || ''
        document.getElementById('email').value = autor.email || ''
        document.getElementById('bio').value = autor.descricao || ''

        const category = document.getElementById('category')
        if (category && autor.area_interesse) {
            const option = Array.from(category.options).find((opt) => opt.value === autor.area_interesse)
            if (option) {
                category.value = autor.area_interesse
            }
        }

        if (autor.foto) {
            const fotoUrl = autor.foto.startsWith('http') ? autor.foto : `/${autor.foto}`
            mostrarAvatar(fotoUrl)
        } else {
            const fotoRes = await fetch(`/api/autores/${autorId}/profile-image`)
            if (fotoRes.ok) {
                mostrarAvatar(`/api/autores/${autorId}/profile-image?t=${Date.now()}`)
            }
        }
    } catch (err) {
        console.error('Erro ao carregar perfil:', err)
    }
}

async function carregarDadosPessoais(autorId) {
    try {
        const response = await fetch(`/api/autores/${autorId}/dados-pessoais`, {
            headers: headersPrivados(autorId),
        })
        const json = await response.json()

        if (!response.ok || !json.sucesso) return

        document.getElementById('cpf').value = json.dados.cpf || ''
        document.getElementById('tel').value = json.dados.telefone || ''
    } catch (err) {
        console.error('Erro ao carregar informações pessoais:', err)
    }
}

function validarDadosPessoais() {
    const cpf = document.getElementById('cpf').value.trim()
    const tel = document.getElementById('tel').value.trim()

    if (cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
        alert('CPF incompleto. Digite os 11 números.')
        return false
    }

    if (tel && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(tel)) {
        alert('Telefone incompleto. Digite os 11 números.')
        return false
    }

    return true
}

function configurarFormulario(autorId) {
    const form = document.querySelector('form')
    const btn = document.querySelector('[data-purpose="save-button"]')

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const nome = document.getElementById('full_name').value.trim()
        const email = document.getElementById('email').value.trim()

        if (!nome || !email) {
            alert('Preencha nome e e-mail.')
            return
        }

        if (!validarDadosPessoais()) return

        const textoOriginal = btn.innerHTML
        btn.disabled = true

        try {
            const dados = {
                nome,
                email,
                descricao: document.getElementById('bio').value.trim(),
                area_interesse: document.getElementById('category').value || null,
            }

            const response = await fetch(`/api/autores/${autorId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados),
            })

            const json = await response.json()

            if (!response.ok || !json.sucesso) {
                throw new Error(json.mensagem || json.erro || 'Erro ao salvar perfil')
            }

            const dadosPessoais = {
                cpf: document.getElementById('cpf').value.trim(),
                telefone: document.getElementById('tel').value.trim(),
            }

            const resPessoais = await fetch(`/api/autores/${autorId}/dados-pessoais`, {
                method: 'PUT',
                headers: headersPrivados(autorId),
                body: JSON.stringify(dadosPessoais),
            })

            const jsonPessoais = await resPessoais.json()

            if (!resPessoais.ok || !jsonPessoais.sucesso) {
                throw new Error(jsonPessoais.erro || 'Erro ao salvar informações pessoais')
            }

            const input = document.getElementById('avatar-input')
            if (input.files?.[0]) {
                await enviarFotoPerfil(autorId, input.files[0])
            }

            const usuario = obterUsuarioLogado()
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                ...usuario,
                nome: dados.nome,
                email: dados.email,
            }))

            alert('Perfil atualizado com sucesso!')
        } catch (err) {
            alert(err.message || 'Erro ao salvar alterações.')
        } finally {
            btn.disabled = false
            btn.innerHTML = textoOriginal
        }
    })
}

async function enviarFotoPerfil(autorId, file) {
    const formData = new FormData()
    formData.append('profileImage', file)

    const response = await fetch(`/api/autores/${autorId}/profile-image`, {
        method: 'POST',
        body: formData,
    })

    const json = await response.json()

    if (!response.ok || !json.sucesso) {
        throw new Error(json.mensagem || json.erro || 'Erro ao enviar foto de perfil')
    }

    if (json.imagePath) {
        mostrarAvatar(`/${json.imagePath}?t=${Date.now()}`)
    }

    return json
}

function configurarSair() {
    const btn = document.getElementById('btn-sair-perfil')
    if (!btn) return

    btn.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY)
        window.location.href = 'login.html'
    })
}

function mascararCPF(seletor) {
    const input = document.querySelector(seletor)
    if (!input) return

    input.addEventListener('input', () => {
        let valor = input.value.replace(/\D/g, '').slice(0, 11)

        if (valor.length > 9) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4')
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3')
        } else if (valor.length > 3) {
            valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2')
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
            valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        } else if (valor.length > 6) {
            valor = valor.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3')
        } else if (valor.length > 2) {
            valor = valor.replace(/(\d{2})(\d+)/, '($1) $2')
        }

        input.value = valor
    })
}