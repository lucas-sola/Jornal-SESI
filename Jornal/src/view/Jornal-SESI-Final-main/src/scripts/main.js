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
            // Embaralhar aleatoriamente os dados para a Home também, se desejado pelo usuário, 
            // ou exibir na ordem original (por ID/data)
            // Vamos usar a ordem original para a Home, mas garantir que preencha tudo.
            
            // 1. Hero (Primeira publicação)
            const ultima = dados[0];
            const hero = document.querySelector(".hero-content");
            if (hero && ultima) {
                const tituloEl = hero.querySelector('.titulo');
                const subtituloEl = hero.querySelector('.subtitulo');
                const dataHero = document.querySelector('#ano-hero');
                const alunoHero = document.querySelector('#aluno-hero');

                if (tituloEl) tituloEl.innerHTML = `<a href="materia.html?id=${ultima.id}" style="color: inherit; text-decoration: none; hover: text-decoration: underline;">${ultima.titulo}</a>`;
                if (subtituloEl) subtituloEl.textContent = ultima.resumo || (ultima.conteudo ? ultima.conteudo.substring(0, 150) + '...' : '');
                if (dataHero) dataHero.textContent = formatarData(ultima.data_publicacao || ultima.data_criacao);
                if (alunoHero) alunoHero.textContent = ultima.autor_nome || 'Equipe SESI';
            }

            // 2. Notícia Destaque (Segunda publicação)
            if (dados.length > 1) {
                const destaque = dados[1];
                const secDestaque = document.querySelector('.noticia-principal');
                if (secDestaque && destaque) {
                    const tituloEl = secDestaque.querySelector('.titulo');
                    const descEl = secDestaque.querySelector('.noticia-destaque-descricao');
                    const autorDestaque = document.querySelector('#aluno-noticia-destaque');
                    const dataDestaque = document.querySelector('#noticia-destaque-data');
                    const imgEl = secDestaque.querySelector('.noticia-destaque-imagem');

                    if (tituloEl) tituloEl.innerHTML = `<a href="materia.html?id=${destaque.id}" style="color: inherit; text-decoration: none;">${destaque.titulo}</a>`;
                    if (descEl) descEl.textContent = destaque.resumo || (destaque.conteudo ? destaque.conteudo.substring(0, 250) + '...' : '');
                    if (autorDestaque) autorDestaque.textContent = destaque.autor_nome || 'Autor';
                    if (dataDestaque) dataDestaque.textContent = formatarData(destaque.data_publicacao || destaque.data_criacao);

                    if (imgEl) {
                        if (destaque.imagem_destaque) {
                            imgEl.src = destaque.imagem_destaque.startsWith('http') ? destaque.imagem_destaque : `/uploads/${destaque.imagem_destaque}`;
                        } else {
                            // Imagem padrão caso não tenha
                            imgEl.src = 'src/images/noticias/noticia-1.png';
                        }
                    }
                }
            }

            // 3. Sidebar (Próximas 3 publicações)
            const sidebar = document.querySelector('.noticia-principal-sidebar');
            if (sidebar) {
                const noticiasSidebar = dados.slice(2, 5);
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
                            if (noticia.imagem_destaque) {
                                imgSidebar.src = noticia.imagem_destaque.startsWith('http') ? noticia.imagem_destaque : `/uploads/${noticia.imagem_destaque}`;
                            } else {
                                imgSidebar.src = 'src/images/noticias/noticia-2.jpg';
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Erro ao carregar publicações:', error);
    }
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