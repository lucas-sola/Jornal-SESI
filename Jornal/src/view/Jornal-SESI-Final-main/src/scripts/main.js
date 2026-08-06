document.addEventListener('DOMContentLoaded', () => {
    formatarHero();
    carregarPublicacoes();
});

/* ─── JavaScript Main ───────────────────────────────────────────────────── */
function formatarHero() {
    const data = new Date();
    const opcoesData = { day: 'numeric', month: 'long' };
    const diaMes = data.toLocaleDateString('pt-BR', opcoesData);
    const anoAtual = data.getFullYear();
    
    const dataPublicacao = document.querySelector('#ano-hero');
    if (dataPublicacao && !dataPublicacao.textContent.trim()) {
        dataPublicacao.innerHTML = `${diaMes}, ${anoAtual}`;
    }

    const alunoHero = document.querySelector('#aluno-hero');
    if (alunoHero && !alunoHero.textContent.trim()) {
        alunoHero.textContent = 'Carregando equipe...';
    }
}

async function carregarPublicacoes() {
    try {
        const response = await fetch('/api/publicacoes');
        const json = await response.json();
        const dados = json.dados || json;

        if (dados && dados.length > 0) {
            // 1. Hero (Primeira publicação)
            const ultima = dados[0];
            const heroSec = document.querySelector(".hero-section");
            const hero = document.querySelector(".hero-content");
            if (hero && ultima) {
                const tituloEl = hero.querySelector('.titulo');
                const subtituloEl = hero.querySelector('.subtitulo');
                const dataHero = document.querySelector('#ano-hero');
                const alunoHero = document.querySelector('#aluno-hero');
                const tagHero = hero.querySelector('.tag');

                if (tituloEl) tituloEl.innerHTML = `<a href="materia.html?id=${ultima.id}" style="color: inherit; text-decoration: none; hover: text-decoration: underline;">${ultima.titulo}</a>`;
                if (subtituloEl) subtituloEl.textContent = ultima.resumo || (ultima.conteudo ? ultima.conteudo.substring(0, 150) + '...' : '');
                if (dataHero) dataHero.textContent = formatarData(ultima.data_publicacao || ultima.data_criacao);
                if (alunoHero) alunoHero.textContent = ultima.autor_nome || 'Equipe SESI';
                if (tagHero) tagHero.textContent = ultima.genero_nome || ultima.tema_principal_nome || 'Destaque';

                if (heroSec && ultima.imagem_destaque) {
                    const heroImgPadrao = 'src/images/noticias/noticia-1.png';
                    const heroImgSrc = resolverImagemPublicacao(ultima.imagem_destaque, heroImgPadrao);

                    // Como é background-image (não <img>), testamos o carregamento manualmente
                    // antes de aplicar, para não deixar o hero sem imagem se o upload sumiu.
                    const testeImg = new Image();
                    testeImg.onload = () => {
                        heroSec.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url('${heroImgSrc}')`;
                    };
                    testeImg.onerror = () => {
                        heroSec.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7)), url('${heroImgPadrao}')`;
                    };
                    testeImg.src = heroImgSrc;
                }
            }

            // 2. Notícia Destaque (Selecionar a marcada como destaque no banco ou a segunda mais recente)
            const indexDestaque = dados.findIndex((p, idx) => idx > 0 && (p.destaque === 1 || p.destaque === true));
            const destaque = indexDestaque !== -1 ? dados[indexDestaque] : (dados[1] || null);
            
            if (destaque) {
                const secDestaque = document.querySelector('.noticia-principal');
                if (secDestaque) {
                    const tituloEl = secDestaque.querySelector('.titulo');
                    const descEl = secDestaque.querySelector('.noticia-destaque-descricao');
                    const autorDestaque = document.querySelector('#aluno-noticia-destaque');
                    const dataDestaque = document.querySelector('#noticia-destaque-data');
                    const imgEl = secDestaque.querySelector('.noticia-destaque-imagem');

                    if (tituloEl) tituloEl.innerHTML = `<a href="materia.html?id=${destaque.id}" style="color: inherit; text-decoration: none;">${destaque.titulo}</a>`;
                    if (descEl) {
                        const textoCompleto = destaque.conteudo || '';
                        descEl.textContent = textoCompleto.length > 750 ? textoCompleto.substring(0, 750) + '...' : textoCompleto;
                    }
                    if (autorDestaque) autorDestaque.textContent = destaque.autor_nome || 'Autor';
                    if (dataDestaque) dataDestaque.textContent = formatarData(destaque.data_publicacao || destaque.data_criacao);

                    if (imgEl) {
                        const imgDestaquePadrao = 'src/images/noticias/noticia-1.png';
                        imgEl.src = resolverImagemPublicacao(destaque.imagem_destaque, imgDestaquePadrao);
                        aplicarFallbackImagem(imgEl, imgDestaquePadrao);
                    }

                    const tagDestaque = secDestaque.querySelector('.tag');
                    if (tagDestaque) {
                        tagDestaque.textContent = destaque.genero_nome || destaque.tema_principal_nome || 'Destaque';
                    }

                    renderizarTags(document.getElementById('tags-noticia-destaque'), destaque);
                }
            }

            // 3. Sidebar (Próximas publicações, evitando hero e destaque)
            const sidebar = document.querySelector('.noticia-principal-sidebar');
            if (sidebar) {
                const noticiasSidebar = dados.filter(p => p.id !== ultima.id && (!destaque || p.id !== destaque.id)).slice(0, 3);
                const sideCards = sidebar.querySelectorAll('.noticia-sidebar');
                
                noticiasSidebar.forEach((noticia, index) => {
                    if (sideCards[index] && noticia) {
                        const tagEl = sideCards[index].querySelector('.tag');
                        const tituloEl = sideCards[index].querySelector('.titulo');
                        const descEl = sideCards[index].querySelector('.descricao-sidebar');
                        const infoAutor = sideCards[index].querySelector('.autor-noticia');
                        const imgSidebar = sideCards[index].querySelector('.sidebar-imagem');

                        if (tagEl) tagEl.textContent = noticia.genero_nome || 'Destaque';
                        if (tituloEl) tituloEl.innerHTML = `<a href="materia.html?id=${noticia.id}" style="color: inherit; text-decoration: none;">${noticia.titulo}</a>`;
                        if (descEl) descEl.textContent = noticia.resumo || (noticia.conteudo ? noticia.conteudo.substring(0, 150) + '...' : '');
                        if (infoAutor) {
                            infoAutor.innerHTML = `Por: <strong>${noticia.autor_nome || 'Escritor'}</strong> &bull; ${formatarData(noticia.data_publicacao || noticia.data_criacao)}`;
                        }

                        if (imgSidebar) {
                            const imgSidebarPadrao = 'src/images/noticias/noticia-2.jpg';
                            imgSidebar.src = resolverImagemPublicacao(noticia.imagem_destaque, imgSidebarPadrao);
                            aplicarFallbackImagem(imgSidebar, imgSidebarPadrao);
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar publicações:', error);
    }
}

function obterTagsPublicacao(noticia) {
    const tags = [];

    if (noticia.tema_principal_nome) tags.push(noticia.tema_principal_nome);
    if (noticia.genero_nome) tags.push(noticia.genero_nome);

    return [...new Set(tags.filter(Boolean))];
}

function renderizarTags(container, noticia) {
    if (!container || !noticia) return;

    container.innerHTML = '';
    const tags = obterTagsPublicacao(noticia);

    if (tags.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = '';
    tags.forEach((texto) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = texto;
        container.appendChild(span);
    });
}

function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}