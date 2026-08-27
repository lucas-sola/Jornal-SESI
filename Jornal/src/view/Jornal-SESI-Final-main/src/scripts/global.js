document.addEventListener('DOMContentLoaded', () =>{
    iniciarTema()
    abrirMenuHamburguer()
    iniciarPesquisa()
})

/* ─── Funções Globais de Autenticação JWT ────────────────────────────────── */
const SESI_STORAGE_USER = 'sesiUsuario'
const SESI_STORAGE_TOKEN = 'sesiToken'

function obterTokenAuth() {
    return localStorage.getItem(SESI_STORAGE_TOKEN) || ''
}

function obterUsuarioLogadoGlobal() {
    try {
        return JSON.parse(localStorage.getItem(SESI_STORAGE_USER))
    } catch {
        return null
    }
}

function headersAuth(extra = {}) {
    const token = obterTokenAuth()
    const usuario = obterUsuarioLogadoGlobal()
    const headers = { ...extra }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    if (usuario?.id) {
        headers['X-Usuario-Id'] = String(usuario.id)
    }
    return headers
}


/* ─── JavaScript Main ───────────────────────────────────────────────────── */
function iniciarTema(){
    const temaBtn = document.querySelector('#themeToggle')

    if (!temaBtn) return

    const temaSalvo = localStorage.getItem('tema')

    if (temaSalvo === 'escuro') {
        document.body.classList.add('dark-theme')
        temaBtn.textContent = '☀️'
    } else{
        temaBtn.textContent = '🌙'
    }

    temaBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme')
        const darkAtivo = document.body.classList.contains('dark-theme')

        if (darkAtivo) {
            localStorage.setItem('tema', 'escuro')
            temaBtn.textContent = '☀️'
        } else{
            localStorage.setItem('tema', 'claro')
            temaBtn.textContent = '🌙'
        }
    })
}

/* ─── JavaScript Header ─────────────────────────────────────────────────── */
function abrirMenuHamburguer() {
    const hamburguer = document.querySelector('.menu-hamburguer')
    const menuMobile = document.querySelector('.menu-mobile')
    const linksMobile = document.querySelectorAll('.menu-mobile a')

    hamburguer.addEventListener('click', function () {
        const estaAberto = menuMobile.classList.contains('ativo')
        hamburguer.classList.toggle('ativo')
        menuMobile.classList.toggle('ativo')

    })

    linksMobile.forEach(link => {
        link.addEventListener('click', function () {
            hamburguer.classList.remove('ativo')
            menuMobile.classList.remove('ativo')
        })

    })

    document.addEventListener('click', (event) => {
        const menuClicado = menuMobile.contains(event.target)
        const hamburguerClicado = hamburguer.contains(event.target)

        if (!menuClicado && !hamburguerClicado) {
            hamburguer.classList.remove('ativo')
            menuMobile.classList.remove('ativo')
        }
    })
}

function iniciarPesquisa() {
    const hamburguer = document.querySelector('.menu-hamburguer')
    const menuMobile = document.querySelector('.menu-mobile')
    const btnPesquisa = document.querySelector('.btn-pesquisa')
    const containerMobile = document.querySelector('.container-pesquisa')
    const containerDesktop = document.querySelector('.container-pesquisa-desktop')
    const pesquisa = document.querySelector('.pesquisa')

    function fecharTudo() {
        containerMobile.classList.remove('ativo')
        containerMobile.style.display = 'none'
        containerDesktop.classList.remove('ativo')
        pesquisa.style.position = ''
    }

    btnPesquisa.addEventListener('click', function (event) {
        event.stopPropagation()

        const isMobile = window.innerWidth <= 1240

        menuMobile?.classList.remove('ativo')
        hamburguer?.classList.remove('ativo')

        if (isMobile) {
            containerDesktop.classList.remove('ativo')

            const estaAberto = containerMobile.classList.contains('ativo')
            if (estaAberto) {
                containerMobile.classList.remove('ativo')
                containerMobile.style.display = 'none'
            } else {
                containerMobile.style.display = 'block'
                requestAnimationFrame(() => containerMobile.classList.add('ativo'))

                pesquisa.style.position = 'static'
            }
        } else {
            containerMobile.classList.remove('ativo')
            containerMobile.style.display = 'none'

            const estaAberto = containerDesktop.classList.contains('ativo')
            if (estaAberto) {
                containerDesktop.classList.remove('ativo')
            } else {
                requestAnimationFrame(() => containerDesktop.classList.add('ativo'))
            }
        }
    })

    document.addEventListener('click', function (event) {
        const clicouNoPesquisa =
            containerMobile.contains(event.target) ||
            containerDesktop.contains(event.target) ||
            btnPesquisa.contains(event.target)

        if (!clicouNoPesquisa) fecharTudo()
    })

    window.addEventListener('resize', fecharTudo)
}

/**
 * Resolve a URL correta para a imagem de destaque de uma publicação.
 * - Se já for uma URL absoluta (http/https) ou um caminho local do front (src/...), usa como está.
 * - Caso contrário, assume que é um caminho relativo salvo pelo backend (multer) e prefixa com /uploads/.
 * - Se não houver imagem_destaque, cai no caminho padrão informado.
 *
 * @param {string|null|undefined} imagemDestaque - valor de noticia.imagem_destaque vindo da API
 * @param {string} [padrao] - imagem padrão a usar quando não há imagem_destaque
 * @returns {string} URL pronta para usar em um atributo src
 */
function resolverImagemPublicacao(imagemDestaque, padrao = 'src/images/foto-sesi.jpg') {
    if (!imagemDestaque) return padrao;

    if (imagemDestaque.startsWith('http://') || imagemDestaque.startsWith('https://') || imagemDestaque.startsWith('src/')) {
        return imagemDestaque;
    }

    // Remove uma eventual barra inicial duplicada antes de prefixar
    const caminhoLimpo = imagemDestaque.replace(/^\/+/, '');
    return `/uploads/${caminhoLimpo}`;
}

/**
 * Aplica um fallback automático em uma tag <img> caso a imagem configurada
 * não carregue (arquivo removido do servidor, deploy sem disco persistente, etc).
 * Evita que o card fique com espaço em branco quando o upload não existe mais.
 *
 * @param {HTMLImageElement} imgEl
 * @param {string} [padrao] - imagem padrão a usar em caso de erro
 */
function aplicarFallbackImagem(imgEl, padrao = 'src/images/foto-sesi.jpg') {
    if (!imgEl) return;
    imgEl.addEventListener('error', function onErro() {
        // Evita loop infinito caso o próprio padrão falhe
        imgEl.removeEventListener('error', onErro);
        if (imgEl.src.indexOf(padrao) === -1) {
            imgEl.src = padrao;
        }
    });
}