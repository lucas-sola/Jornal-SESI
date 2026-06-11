document.addEventListener('DOMContentLoaded', () =>{
    iniciarTema()
    abrirMenuHamburguer()
    iniciarPesquisa()
})

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