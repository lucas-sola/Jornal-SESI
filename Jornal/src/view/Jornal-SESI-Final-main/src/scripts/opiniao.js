document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.querySelector('.categoria-grid');
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-color); font-size: 1.1rem;"><div class="spinner" style="margin: 0 auto 15px;"></div>Carregando artigos de opinião...</div>';

    try {
        const response = await fetch('/api/publicacoes');
        const json = await response.json();
        const dados = json.dados || json;

        if (!dados || dados.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">Nenhuma matéria encontrada no banco.</p>';
            return;
        }

        // Filtro para Opinião: Editorial (1), Manifesto (4), Carta Aberta (5), Artigo de Opinião (9)
        let opiniao = dados.filter(p => [1, 4, 5, 9].includes(p.genero_id));

        if (opiniao.length < 3) {
            opiniao = [...dados];
        }

        // Embaralhar aleatoriamente
        embaralhar(opiniao);

        // Limitar a no máximo 6 notícias
        const selecionadas = opiniao.slice(0, 6);

        grid.innerHTML = '';

        selecionadas.forEach(noticia => {
            const card = criarCardElement(noticia);
            grid.appendChild(card);
        });

        iniciarAnimacaoECurtidas();

    } catch (error) {
        console.error('Erro ao carregar opinião:', error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--primary-color);">Erro ao carregar matérias do banco de dados.</p>';
    }
});

function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

function criarCardElement(noticia) {
    const article = document.createElement('article');
    article.className = 'post-card';

    // Determinar imagem
    let imgSrc = 'src/images/imagens-links/jornal-vintage.webp';
    if (noticia.imagem_destaque) {
        imgSrc = noticia.imagem_destaque.startsWith('http') || noticia.imagem_destaque.startsWith('src/')
            ? noticia.imagem_destaque 
            : `/uploads/${noticia.imagem_destaque}`;
    }

    const tag = noticia.genero_nome || 'Opinião';
    const titulo = noticia.titulo;
    const resumo = noticia.resumo || (noticia.conteudo ? noticia.conteudo.substring(0, 160) + '...' : '');
    const autor = noticia.autor_nome || 'Equipe SESI';
    const dataFormated = formatarData(noticia.data_publicacao || noticia.data_criacao);

    article.innerHTML = `
        <div class="post-card-img-wrap">
            <img src="${imgSrc}" class="post-card-img" alt="${titulo}" />
        </div>
        <div class="post-card-content">
            <span class="post-card-tag">${tag}</span>
            <h2 class="post-card-title"><a href="materia.html?id=${noticia.id}">${titulo}</a></h2>
            <p class="post-card-excerpt">${resumo}</p>
            <div class="post-card-footer">
                <span class="post-card-author">Por: ${autor}</span>
                <span class="post-card-date">${dataFormated}</span>
            </div>
        </div>
    `;

    article.dataset.postId = noticia.id;
    return article;
}

function iniciarAnimacaoECurtidas() {
    const cards = document.querySelectorAll('.post-card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });

    cards.forEach(card => {
        const footer = card.querySelector('.post-card-footer');
        if (!footer) return;

        const postId = card.dataset.postId || Math.random().toString(36).substr(2, 9);
        const dateSpan = card.querySelector('.post-card-date');
        const originalDateText = dateSpan ? dateSpan.textContent : '';

        const footerRight = document.createElement('div');
        footerRight.style.display = 'flex';
        footerRight.style.alignItems = 'center';
        footerRight.style.gap = '14px';

        const newDateSpan = document.createElement('span');
        newDateSpan.textContent = originalDateText;
        footerRight.appendChild(newDateSpan);

        const containerLikes = document.createElement('div');
        containerLikes.className = 'post-card-likes';
        containerLikes.style.display = 'flex';
        containerLikes.style.alignItems = 'center';
        containerLikes.style.gap = '6px';
        containerLikes.style.cursor = 'pointer';
        containerLikes.style.transition = 'all 0.2s ease';

        const key = `likes-pub-${postId}`;
        let count = parseInt(localStorage.getItem(key) || 0);
        let curtido = localStorage.getItem(`curtido-pub-${postId}`) === 'true';

        containerLikes.innerHTML = `
            <i class="${curtido ? 'fa-solid' : 'fa-regular'} fa-heart" style="color: ${curtido ? '#ef4444' : 'inherit'};"></i>
            <span class="likes-count">${count}</span>
        `;

        footerRight.appendChild(containerLikes);

        if (dateSpan) {
            dateSpan.remove();
        }
        footer.appendChild(footerRight);

        containerLikes.addEventListener('click', () => {
            curtido = !curtido;
            if (curtido) {
                count++;
            } else {
                count--;
            }

            localStorage.setItem(key, count);
            localStorage.setItem(`curtido-pub-${postId}`, curtido);

            const heartIcon = containerLikes.querySelector('i');
            heartIcon.className = curtido ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
            heartIcon.style.color = curtido ? '#ef4444' : '';
            containerLikes.querySelector('.likes-count').textContent = count;
            
            containerLikes.style.transform = 'scale(1.2)';
            setTimeout(() => {
                containerLikes.style.transform = 'scale(1)';
            }, 150);
        });
    });

    const inputsPesquisa = document.querySelectorAll('.input-pesquisa');
    inputsPesquisa.forEach(input => {
        input.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            
            cards.forEach(card => {
                const titulo = card.querySelector('.post-card-title').textContent.toLowerCase();
                const resumo = card.querySelector('.post-card-excerpt').textContent.toLowerCase();
                const tag = card.querySelector('.post-card-tag').textContent.toLowerCase();
                
                if (titulo.includes(termo) || resumo.includes(termo) || tag.includes(termo)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}
