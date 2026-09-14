const STORAGE_KEY = 'sesiUsuario'

let imagemSelecionada = null
let autorLogado = null

document.addEventListener('DOMContentLoaded', async () => {
    await verificarAcessoAutor()
})

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY))
    } catch {
        return null
    }
}

function headersAutor(autorId) {
    const token = localStorage.getItem('sesiToken')
    const headers = { 'X-Usuario-Id': String(autorId) }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}

async function verificarAcessoAutor() {
    const usuario = obterUsuarioLogado()
    const acessoNegado = document.getElementById('acesso-negado')
    const publicacaoApp = document.getElementById('publicacao-app')

    if (!usuario?.id) {
        acessoNegado.classList.remove('hidden')
        showToast('Você precisa estar logado para publicar. Faça login para continuar.', 'warning')
        return
    }

    // Apenas autores oficiais do jornal (e-mail institucional cadastrado no
    // banco) e administradores podem publicar. Contas externas só interagem.
    if (usuario.pode_publicar === false || usuario.pode_publicar === 0) {
        acessoNegado.classList.remove('hidden')
        showToast('Apenas autores oficiais do jornal podem publicar matérias.', 'warning')
        return
    }

    // Libera o formulário na hora com os dados salvos no navegador,
    // sem depender de chamada à API (funciona mesmo se a API estiver fora do ar)
    autorLogado = usuario
    publicacaoApp.classList.remove('hidden')
    preencherDadosAutor(autorLogado)

    try {
        iniciarFormulario()
        iniciarImagemDestaque()
        iniciarPreview()
        await carregarOpcoesFormulario()
    } catch {
        showToast('Não foi possível carregar gêneros/temas. Verifique se o servidor está rodando.', 'warning')
    }

    // Atualiza o perfil em segundo plano (opcional; nunca bloqueia o formulário)
    try {
        const response = await fetch(`/api/autores/${usuario.id}`)
        const json = await response.json()

        if (response.ok && json.sucesso && json.dados?.email) {
            autorLogado = { ...json.dados, cargo: json.dados.cargo || usuario.cargo }
            preencherDadosAutor(autorLogado)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(autorLogado))

            // Sessões antigas (antes da flag pode_publicar): se a API disser que
            // o usuário não pode publicar, esconde o formulário na hora
            if (autorLogado.pode_publicar === 0 || autorLogado.pode_publicar === false) {
                publicacaoApp.classList.add('hidden')
                acessoNegado.classList.remove('hidden')
                showToast('Apenas autores oficiais do jornal podem publicar matérias.', 'warning')
            }
        }
    } catch {
        // Segue com os dados locais; o backend valida a permissão ao publicar
    }
}

function preencherDadosAutor(autor) {
    document.getElementById('autor-nome').textContent = autor.nome
    document.getElementById('autor-email').textContent = autor.email

    const avatarEl = document.getElementById('autor-avatar')
    if (autor.foto && avatarEl) {
        const fotoUrl = autor.foto.startsWith('http') ? autor.foto : `/${autor.foto}`
        const placeholderHtml = avatarEl.innerHTML
        const img = document.createElement('img')
        img.src = fotoUrl
        img.alt = autor.nome
        img.className = 'avatar-img'
        // Se a foto não carregar (arquivo removido do servidor), mantém o ícone padrão
        img.addEventListener('error', () => {
            avatarEl.innerHTML = placeholderHtml
        })
        avatarEl.innerHTML = ''
        avatarEl.appendChild(img)
    }
}

async function carregarOpcoesFormulario() {
    const [generosRes, temasRes, categoriasRes] = await Promise.all([
        fetch('/api/generos'),
        fetch('/api/temas-principais'),
        fetch('/api/categorias'),
    ])

    const generosJson = await generosRes.json()
    const temasJson = await temasRes.json()
    const categoriasJson = await categoriasRes.json()

    const generoSelect = document.getElementById('genero')
    const temaSelect = document.getElementById('tema')
    const categoriasContainer = document.getElementById('categorias-container')

    ;(generosJson.dados || []).forEach((genero) => {
        const option = document.createElement('option')
        option.value = genero.id
        option.textContent = genero.nome
        generoSelect.appendChild(option)
    })

    ;(temasJson.dados || []).forEach((tema) => {
        const option = document.createElement('option')
        option.value = tema.id
        option.textContent = tema.nome
        temaSelect.appendChild(option)
    })

    ;(categoriasJson.dados || []).forEach((cat) => {
        const wrapper = document.createElement('label')
        wrapper.style.display = 'flex'
        wrapper.style.alignItems = 'center'
        wrapper.style.gap = '6px'
        wrapper.style.cursor = 'pointer'
        wrapper.style.fontSize = '13px'
        wrapper.style.color = 'var(--text-color)'
        wrapper.style.background = 'var(--post-bg)'
        wrapper.style.padding = '4px 10px'
        wrapper.style.borderRadius = '20px'
        wrapper.style.border = '1px solid var(--post-border)'

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.name = 'categorias'
        checkbox.value = cat.nome
        checkbox.style.cursor = 'pointer'

        checkbox.addEventListener('change', atualizarPreview)

        wrapper.appendChild(checkbox)
        wrapper.appendChild(document.createTextNode(cat.nome))
        categoriasContainer.appendChild(wrapper)
    })

    if (autorLogado?.area_interesse) {
        const mapaTema = {
            noticias: 'Conflitos Bélicos',
            esportes: 'Avanço Tecnológico',
            cultura: 'Meio Ambiente',
            ciencias: 'Ciência',
            opiniao: 'Legislações Atuais',
        }
        const temaPreferido = mapaTema[autorLogado.area_interesse]
        if (temaPreferido) {
            const option = Array.from(temaSelect.options).find((opt) => opt.textContent === temaPreferido)
            if (option) temaSelect.value = option.value
        }
    }
}

function iniciarFormulario() {
    const form = document.getElementById('form-publicacao')
    const btnLimpar = document.getElementById('btnLimpar')

    form.addEventListener('submit', async (event) => {
        event.preventDefault()
        await publicarTexto()
    })

    btnLimpar.addEventListener('click', limparFormulario)
}

function iniciarImagemDestaque() {
    const input = document.getElementById('imagemInput')
    const zone = document.getElementById('imagemDestaqueZone')
    const preview = document.getElementById('imagemDestaquePreview')
    const previewImg = document.getElementById('imagemDestaqueImg')
    const btnRemover = document.getElementById('btnRemoverImagem')

    input.addEventListener('change', () => {
        if (input.files[0]) definirImagem(input.files[0])
    })

    btnRemover.addEventListener('click', () => {
        imagemSelecionada = null
        input.value = ''
        preview.classList.add('hidden')
        zone.classList.remove('hidden')
        atualizarPreview()
    })

    setupDragDrop(zone, (arquivos) => {
        const imagem = arquivos.find((arquivo) => arquivo.type.startsWith('image/'))
        if (imagem) definirImagem(imagem)
    })

    function definirImagem(arquivo) {
        if (!/^image\/(jpeg|jpg|png|webp)$/.test(arquivo.type)) {
            showToast('Apenas imagens JPG, PNG ou WEBP são permitidas.', 'error')
            return
        }

        if (arquivo.size > 8 * 1024 * 1024) {
            showToast('A imagem deve ter no máximo 8MB.', 'error')
            return
        }

        imagemSelecionada = arquivo
        const reader = new FileReader()
        reader.onload = (e) => {
            previewImg.src = e.target.result
            preview.classList.remove('hidden')
            zone.classList.add('hidden')
            atualizarPreview()
        }
        reader.readAsDataURL(arquivo)
    }
}

function iniciarPreview() {
    ;['titulo', 'subtitulo', 'conteudo'].forEach((id) => {
        const el = document.getElementById(id)
        el.addEventListener('input', atualizarPreview)
    })
    atualizarPreview()
}

function atualizarPreview() {
    const titulo = document.getElementById('titulo').value.trim()
    const subtitulo = document.getElementById('subtitulo').value.trim()
    const conteudo = document.getElementById('conteudo').value.trim()
    const previewBody = document.getElementById('contentPreviewBody')
    const previewBadge = document.getElementById('previewBadge')

    const possuiConteudo = titulo || subtitulo || conteudo || imagemSelecionada

    if (!possuiConteudo) {
        previewBody.innerHTML = '<p class="content-preview-empty">Preencha título, subtítulo e texto para ver a prévia.</p>'
        previewBadge.textContent = 'Vazio'
        previewBadge.classList.remove('has-content')
        return
    }

    previewBody.innerHTML = ''

    if (imagemSelecionada) {
        const imgWrap = document.createElement('div')
        imgWrap.className = 'content-preview-image'
        const img = document.createElement('img')
        img.src = document.getElementById('imagemDestaqueImg').src
        img.alt = 'Prévia da imagem'
        imgWrap.appendChild(img)
        previewBody.appendChild(imgWrap)
    }

    if (titulo) {
        const h4 = document.createElement('h4')
        h4.className = 'content-preview-title'
        h4.textContent = titulo
        previewBody.appendChild(h4)
    }

    if (subtitulo) {
        const p = document.createElement('p')
        p.className = 'content-preview-subtitle'
        p.textContent = subtitulo
        previewBody.appendChild(p)
    }

    if (conteudo) {
        const div = document.createElement('div')
        div.className = 'content-preview-text'
        div.textContent = conteudo
        previewBody.appendChild(div)
    }

    previewBadge.textContent = `${conteudo.length} car.`
    previewBadge.classList.add('has-content')
}

function validarFormulario() {
    const titulo = document.getElementById('titulo').value.trim()
    const conteudo = document.getElementById('conteudo').value.trim()
    const genero = document.getElementById('genero').value
    const tema = document.getElementById('tema').value

    if (!titulo) {
        showToast('Preencha o título da matéria.', 'error')
        return false
    }

    if (!conteudo) {
        showToast('Preencha o texto principal.', 'error')
        return false
    }

    if (!genero || !tema) {
        showToast('Selecione o gênero e o tema principal.', 'error')
        return false
    }

    return true
}

async function publicarTexto() {
    if (!validarFormulario() || !autorLogado) return

    const btn = document.getElementById('btnPublicar')
    const textoOriginal = btn.innerHTML
    btn.disabled = true
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...'

    try {
        const formData = new FormData()
        formData.append('titulo', document.getElementById('titulo').value.trim())
        formData.append('subtitulo', document.getElementById('subtitulo').value.trim())
        formData.append('conteudo', document.getElementById('conteudo').value.trim())
        formData.append('genero_id', document.getElementById('genero').value)
        formData.append('tema_principal_id', document.getElementById('tema').value)
        
        const checkboxes = document.querySelectorAll('#categorias-container input[type="checkbox"]:checked')
        const tags = Array.from(checkboxes).map(cb => cb.value).join(', ')
        formData.append('tags', tags)
        formData.append('destaque', document.getElementById('destaque').checked)

        if (imagemSelecionada) {
            formData.append('imagem_destaque', imagemSelecionada)
        }

        const response = await fetch('/api/publicacoes/autor', {
            method: 'POST',
            headers: headersAutor(autorLogado.id),
            body: formData,
        })

        const json = await response.json()

        if (!response.ok || !json.sucesso) {
            throw new Error(json.erro || 'Erro ao publicar a matéria.')
        }

        showToast('Texto publicado com sucesso!', 'success')
        limparFormulario()

        setTimeout(() => {
            window.location.href = `materia.html?id=${json.id}`
        }, 1200)
    } catch (err) {
        showToast(err.message || 'Erro ao publicar.', 'error')
    } finally {
        btn.disabled = false
        btn.innerHTML = textoOriginal
    }
}

function limparFormulario() {
    document.getElementById('form-publicacao').reset()
    imagemSelecionada = null
    document.getElementById('imagemInput').value = ''
    document.getElementById('imagemDestaquePreview').classList.add('hidden')
    document.getElementById('imagemDestaqueZone').classList.remove('hidden')
    atualizarPreview()
    showToast('Formulário limpo.')
}

function setupDragDrop(zone, callback) {
    zone.addEventListener('dragover', (event) => {
        event.preventDefault()
        zone.classList.add('drag-over')
    })

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over')
    })

    zone.addEventListener('drop', (event) => {
        event.preventDefault()
        zone.classList.remove('drag-over')
        if (event.dataTransfer.files.length) {
            callback([...event.dataTransfer.files])
        }
    })
}

// showToast é global (definido em global.js), carregado antes deste arquivo