document.addEventListener('DOMContentLoaded', () => {
    iniciarTabs()
    iniciarTags()
    iniciarToolbar()
    iniciarPreviewConteudo()
    iniciarGaleria()
    iniciarUploadVideo()
    iniciarBotoesAcao()
})

function iniciarTabs(){
    const tabs = document.querySelectorAll('.tab')

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'))

            tab.classList.add('active')

            showToast(`Aba "${tab.textContent.trim()}" selecionada`)
        })
    })
}

function iniciarTags(){
    const tagInput = document.querySelector('#tagInput')
    const addTagBtn = document.querySelector('#addTagBtn')
    const tagList = document.querySelector('#tagsList')

    function criarTag(valor){
        const texto = valor.trim()

        if (!texto) return

        const existente = [...tagList.querySelectorAll('.tag-chip span')].map(span => span.textContent.toLocaleLowerCase());
        
        if (existente.includes(texto.toLowerCase())) {
            showToast('Tag já adicionada', 'error')
            return
        }

        const chip = document.createElement('span')

        chip.className = 'tag-chip'

        chip.innerHTML=`
            <span>${texto}</span>
            <button title="Remover tag">&times;</button>
        `

        chip.querySelector('button').addEventListener('click', () => {
            chip.style.transform = 'scale(0.8)'
            chip.style.opacity = '0'
            chip.style.transition = 'all 0.15s ease'

            setTimeout(() => chip.remove(), 150)
        })

        tagList.appendChild(chip)
        tagInput.value = ''
        tagInput.focus()
    }

    addTagBtn.addEventListener('click', () => {criarTag(tagInput.value)})

    tagInput.addEventListener('keydown', event => {
        if (event.key === 'Enter'){
            event.preventDefault()
            criarTag(tagInput.value)
        }
    })
}

function iniciarToolbar(){
    const btns = document.querySelectorAll('.toolbar-btn')

    btns.forEach(botao => {
        botao.addEventListener('click', () => {
            btns.forEach(btn => btn.classList.remove('active'))
            botao.classList.add('active')

            setTimeout(() => {
                botao.classList.remove('active')
            }, 1200);
        })
    })
}

function iniciarPreviewConteudo(){
    const tituloInput = document.querySelector('input[placeholder="Digite o título do seu vídeo..."]')
    const editorCorpo = document.querySelector('.editor-body')
    const previewBody = document.querySelector('#contentPreviewBody')
    const previewBadge = document.querySelector('#previewBadge')

    function atualizarPreview(){
        const titulo = tituloInput ? tituloInput.value.trim() : ''
        const texto = editorCorpo.innerHTML.trim()

        const possuiConteudo = titulo.length > 0 || texto.length > 0

        if (possuiConteudo){
            previewBody.innerHTML = ''

            if (titulo) {
                const tituloEl = document.createElement('h4')
                tituloEl.className = 'content-preview-title'
                tituloEl.textContent = titulo

                previewBody.appendChild(tituloEl)
            }

            if (texto) {
                const textoEl = document.createElement('div')
                textoEl.className = 'content-preview-text'
                textoEl.innerHTML = editorCorpo.innerHTML

                previewBody.appendChild(textoEl)
            }

            previewBadge.textContent = `${titulo.length + texto.length} car.`
            previewBadge.classList.add('has-content')
            previewBody.scrollTop = previewBody.scrollHeight
        } else {
            previewBody.innerHTML = ''
            const vazio = document.createElement('p')

            vazio.className = 'content-preview-empty'
            vazio.textContent = 'Comece a digitar o título ou a matéria para ver a prévia!'

            previewBody.appendChild(vazio)
            previewBadge.textContent = 'Vazio'
            previewBadge.classList.remove('has-content')
        }
    }

    editorCorpo.addEventListener('input', atualizarPreview)

    if (tituloInput) tituloInput.addEventListener('input', atualizarPreview)

    atualizarPreview()
}

function iniciarGaleria() {
    const imgInput = document.querySelector('#imgInput')
    const imgUpload = document.querySelector('#imgUploadZone')
    const galeriaGrid = document.querySelector('#galleryGrid')

    const maximo = 10

    construirSlots(maximo)

    function construirSlots(quantidade) {
        galeriaGrid.innerHTML = ''

        for (let i = 0; i < quantidade; i++){
            const slot = document.createElement('div')

            slot.className = 'gallery-item'

            slot.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2"
                        stroke="currentColor" stroke-width="1.5"/>

                    <circle cx="8" cy="9" r="2"
                        stroke="currentColor" stroke-width="1.2"/>

                    <path d="M2 17l5-5 4 4 3-3 7 5"
                        stroke="currentColor"
                        stroke-width="1.2"
                        stroke-linejoin="round"/>
                </svg>
                `
            
            galeriaGrid.appendChild(slot)
        }
    }

    function pegarSlotsVazios() {
        return [...galeriaGrid.querySelectorAll('.gallery-item:not(.has-image)')]
    }

    function adicionarImagens(arquivos){
        const vazio = pegarSlotsVazios()

        if (vazio.length === 0){ 
            showToast('Galeria cheia (máx. 10 imagens)', 'error')
            return
        }

        const total = Math.min(arquivos.length, vazio.length)

        for (let i = 0; i < total; i++) {
            const arquivo = arquivos[i]

            if (!arquivo.type.startsWith('image/')) continue

            const leitor = new FileReader()
            const slot = vazio[i]

            leitor.onload = event => {
                slot.innerHTML = `
                    <img src="${event.target.result}" alt="${arquivo.name}" />

                    <div class="gallery-item-overlay">
                        <button title="Remover imagem">
                            <svg viewBox="0 0 16 16" fill="none">
                                <path d="M5 3h6M3 5h10l-1 8H4L3 5z"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linejoin="round"/>

                                <path d="M7 7v4M9 7v4"
                                    stroke="currentColor"
                                    stroke-width="1.2"
                                    stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                `
                slot.classList.add('has-image')
                slot.querySelector('button').addEventListener('click', () => removerImagem(slot))
            }

            leitor.readAsDataURL(arquivo)
        }
    }

    function removerImagem(slot){
        slot.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2"
                    stroke="currentColor" stroke-width="1.5"/>

                <circle cx="8" cy="9" r="2"
                    stroke="currentColor" stroke-width="1.2"/>

                <path d="M2 17l5-5 4 4 3-3 7 5"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linejoin="round"/>
            </svg>
        `

        slot.classList.remove('has-image')
    }

    imgInput.addEventListener('change', event => {
        adicionarImagens([...event.target.files])
    })

    setupDragDrop(imgUpload, arquivos => adicionarImagens(arquivos))
}

function iniciarUploadVideo() {
    const videoInput = document.querySelector('#videoInput')
    const videoUploadZone = document.querySelector('#videoUploadZone')
    const videoPreview = document.querySelector('#videoPreview')
    const videoPlayer = document.querySelector('#videoPlayer')
    const removeVideoBtn = document.querySelector('#removeVideo')

    function carregarVideo(arquivo){
        if (!arquivo || !arquivo.type.startsWith('video/')){
            showToast('Por favor, selecione um arquivo de vídeo.', 'error')
            return
        }

        const url = URL.createObjectURL(arquivo)

        videoPlayer.src = url
        videoUploadZone.classList.add('hidden')
        videoPreview.classList.remove('hidden')

        showToast('Vídeo carregado com sucesso!', 'success')
    }

    videoInput.addEventListener('change', event => {
        if (event.target.files[0]) carregarVideo(event.target.files[0]) 
    })

    removeVideoBtn.addEventListener('click', () => {
        videoPlayer.pause()
        videoPlayer.src = ''

        videoPreview.classList.add('hidden')
        videoUploadZone.classList.remove('hidden')

        videoInput.value = ''

        showToast('Vídeo removido')
    })

    setupDragDrop(videoUploadZone, arquivos => {
        const video = [...arquivos].find(arquivo => arquivo.type.startsWith('video/'))

        if (video) {
            carregarVideo(video)
        } else{
            showToast ('Por favor, solte um arquivo de vídeo', 'error')
        }
    })
}

function iniciarBotoesAcao() {
    document.querySelector('.btn-draft').addEventListener('click', () => showToast('Rascunho salvo!'))

    document.querySelector('.btn-review').addEventListener('click', () => showToast('Abrindo prévia...'))

    document.querySelector('.btn-publish').addEventListener('click', () => {
        const titulo = document.querySelector('.campo-input').value.trim()

        if (!titulo){
            showToast('Por favor, adicione um título antes de publicar', 'error')
            return
        }

        showToast('Publicado com sucesso!', 'success')
    })
}

/* ─── Auxiliadores ───────────────────────────────────────────────────── */

function setupDragDrop(zone, callback){
    zone.addEventListener('dragover', event => {
        event.preventDefault()
        zone.classList.add('drag-over')
    })

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over')
    })

    zone.addEventListener('drop', event => {
        event.preventDefault()

        zone.classList.remove('drag-over')

        if (event.dataTransfer.files.length){
            callback([...event.dataTransfer.files])
        }
    })
}

let toastTimer = null

function showToast(message, type = ''){
    const toast = document.querySelector('#toast')
    toast.textContent = message
    toast.className = 'toast' + (type ? ` ${type}` : '')
    toast.classList.remove('hidden')

    if (toastTimer) clearTimeout(toastTimer)
    
    toastTimer = setTimeout(() => {
        toast.classList.add('hidden')
    }, 2800)
}