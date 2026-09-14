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
    configurarAlteracaoSenha()
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
    const token = localStorage.getItem('sesiToken')
    const headers = {
        'Content-Type': 'application/json',
        'X-Usuario-Id': String(autorId),
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
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
            showToast('Apenas imagens JPG ou PNG são permitidas.', 'warning')
            input.value = ''
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('A imagem deve ter no máximo 5MB.', 'warning')
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

        const linkPublicar = document.getElementById('link-publicar-container')
        if (linkPublicar) {
            // Autores oficiais do jornal e admins podem publicar; contas externas, não
            const podePublicar =
                autor.pode_publicar === true ||
                autor.pode_publicar === 1 ||
                autor.cargo === 'admin' ||
                usuario?.cargo === 'admin'
            linkPublicar.classList.toggle('hidden', !podePublicar)
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
        showToast('CPF incompleto. Digite os 11 números.', 'warning')
        return false
    }

    if (tel && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(tel)) {
        showToast('Telefone incompleto. Digite os 11 números.', 'warning')
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
            showToast('Preencha nome e e-mail.', 'warning')
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
                headers: headersPrivados(autorId),
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

            showToast('Perfil atualizado com sucesso!', 'success')
        } catch (err) {
            showToast(err.message || 'Erro ao salvar alterações.', 'error')
        } finally {
            btn.disabled = false
            btn.innerHTML = textoOriginal
        }
    })
}

async function enviarFotoPerfil(autorId, file) {
    const formData = new FormData()
    formData.append('profileImage', file)

    const token = localStorage.getItem('sesiToken')
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (autorId) headers['X-Usuario-Id'] = String(autorId)

    const response = await fetch(`/api/autores/${autorId}/profile-image`, {
        method: 'POST',
        headers,
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

function configurarAlteracaoSenha() {
    const form = document.getElementById('form-alterar-senha')
    if (!form) return

    form.addEventListener('submit', async (event) => {
        event.preventDefault()

        const senhaAtual = document.getElementById('senha-atual').value
        const novaSenha = document.getElementById('nova-senha').value
        const confirmarSenha = document.getElementById('confirmar-senha').value

        if (novaSenha !== confirmarSenha) {
            showToast('A confirmação da nova senha não confere.', 'warning')
            return
        }

        const btn = document.getElementById('btn-alterar-senha')
        const textoOriginal = btn.textContent
        btn.disabled = true
        btn.textContent = 'Alterando...'

        try {
            const response = await fetch('/api/auth/alterar-senha', {
                method: 'POST',
                headers: headersPrivados(),
                body: JSON.stringify({ senhaAtual, novaSenha, confirmarSenha }),
            })
            const json = await response.json()

            if (!response.ok || !json.sucesso) {
                throw new Error(json.erro || json.mensagem || 'Não foi possível alterar a senha')
            }

            form.reset()
            showToast('Senha alterada com sucesso!', 'success')
        } catch (err) {
            showToast(err.message || 'Erro ao alterar a senha.', 'error')
        } finally {
            btn.disabled = false
            btn.textContent = textoOriginal
        }
    })
}
