document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/api/publicacoes/${postId}`);
        const json = await response.json();

        if (!json.sucesso || !json.dados) {
            exibirErro('Matéria não encontrada.');
            return;
        }

        const noticia = json.dados;
        preencherMateria(noticia);
        configurarCurtidas(noticia.id);
        configurarCompartilhar(noticia);
        await carregarRelacionadas(noticia);

    } catch (error) {
        console.error('Erro ao carregar matéria:', error);
        exibirErro('Erro ao carregar os detalhes da matéria.');
    }
});

function formatarData(dataStr) {
    if (!dataStr) return '';
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function obterCategoriaInfo(noticia) {
    // Esportes: Tema principal 'Esportes'
    if (noticia.tema_principal_nome === 'Esportes') {
        return { nome: 'Esportes', url: 'esportes.html' };
    }
    // Opinião: Editorial (1), Manifesto (4), Carta Aberta (5), Artigo de Opinião (9)
    if ([1, 4, 5, 9].includes(noticia.genero_id)) {
        return { nome: 'Opinião', url: 'opiniao.html' };
    }
    // Ciências: Avanço Tecnológico (3), Saúde (7), Ciência (8)
    if ([3, 7, 8].includes(noticia.tema_principal_id)) {
        return { nome: 'Ciências', url: 'ciencias.html' };
    }
    // Cultura: depoimento pessoal (7), manifestos (4)
    if ([4, 7].includes(noticia.genero_id)) {
        return { nome: 'Cultura', url: 'cultura.html' };
    }
    // Noticias: Conflitos Bélicos (1), Legislações (2), Violência/Segurança (4), Eleições (6), Vício em Jogos (9)
    if ([1, 2, 4, 6, 9].includes(noticia.tema_principal_id)) {
        return { nome: 'Notícias', url: 'noticias.html' };
    }
    return { nome: 'Notícias', url: 'noticias.html' };
}

function preencherMateria(noticia) {
    const categoriaInfo = obterCategoriaInfo(noticia);
    
    // Breadcrumb
    const breadcrumbCategoria = document.getElementById('breadcrumb-categoria');
    const breadcrumbTitulo = document.getElementById('breadcrumb-titulo');
    if (breadcrumbCategoria) {
        breadcrumbCategoria.textContent = categoriaInfo.nome;
        breadcrumbCategoria.href = categoriaInfo.url;
    }
    if (breadcrumbTitulo) {
        breadcrumbTitulo.textContent = noticia.titulo;
    }

    // Hero Tag, Titulo, Autor, Data
    const tagEl = document.getElementById('materia-tag');
    const tituloEl = document.getElementById('materia-titulo');
    const autorEl = document.getElementById('materia-autor');
    const dataEl = document.getElementById('materia-data');

    if (tagEl) {
        tagEl.textContent = noticia.tema_principal_nome || noticia.genero_nome || categoriaInfo.nome;
    }
    if (tituloEl) {
        tituloEl.textContent = noticia.titulo;
    }
    if (autorEl) {
        autorEl.textContent = noticia.autor_nome || 'Equipe SESI';
    }
    if (dataEl) {
        dataEl.textContent = formatarData(noticia.data_publicacao || noticia.data_criacao);
    }

    // Imagem
    const imgEl = document.getElementById('materia-imagem');
    const legendaEl = document.getElementById('materia-legenda');
    const imgWrap = document.getElementById('materia-imagem-wrap');

    if (imgEl) {
        if (noticia.imagem_destaque) {
            imgEl.src = noticia.imagem_destaque.startsWith('http') || noticia.imagem_destaque.startsWith('src/') 
                ? noticia.imagem_destaque 
                : `/uploads/${noticia.imagem_destaque}`;
            imgEl.alt = noticia.titulo;
            if (legendaEl) {
                legendaEl.textContent = noticia.subtitulo || '';
            }
        } else {
            // Se não tiver imagem, podemos ocultar o wrap ou usar uma padrão
            imgEl.src = 'src/images/foto-sesi.jpg';
            imgEl.alt = noticia.titulo;
            if (legendaEl) {
                legendaEl.textContent = noticia.subtitulo || '';
            }
        }
    }

    // Conteúdo
    const corpoEl = document.getElementById('materia-corpo');
    const resumoEl = document.getElementById('materia-resumo');

    if (resumoEl) {
        resumoEl.textContent = noticia.resumo || '';
    }

    if (corpoEl) {
        corpoEl.innerHTML = '';
        if (noticia.conteudo) {
            // Dividir em parágrafos e adicionar
            const paragrafos = noticia.conteudo.split('\n').filter(p => p.trim() !== '');
            paragrafos.forEach(pTexto => {
                const p = document.createElement('p');
                p.className = 'materia-paragrafo';
                p.textContent = pTexto;
                corpoEl.appendChild(p);
            });
        } else {
            corpoEl.innerHTML = '<p class="materia-paragrafo">Conteúdo indisponível.</p>';
        }
    }

    // Tags inferiores
    const tagsContainer = document.getElementById('materia-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        const tags = [];
        if (noticia.tema_principal_nome) tags.push(noticia.tema_principal_nome);
        if (noticia.genero_nome) tags.push(noticia.genero_nome);
        
        tags.forEach(tagText => {
            const span = document.createElement('span');
            span.className = 'materia-tag-item';
            span.textContent = tagText;
            tagsContainer.appendChild(span);
        });
    }

    // Personalizar cor do hero de acordo com a categoria
    const heroSec = document.getElementById('materia-hero');
    if (heroSec) {
        heroSec.className = 'materia-hero'; // Reset
        const catClass = categoriaInfo.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        heroSec.classList.add(`hero-cat-${catClass}`);
    }
}

function configurarCurtidas(postId) {
    const btnCurtir = document.getElementById('btn-curtir');
    const likesCount = document.getElementById('materia-likes');
    if (!btnCurtir || !likesCount) return;

    const key = `likes-pub-${postId}`;
    const keyCurtido = `curtido-pub-${postId}`;

    let count = parseInt(localStorage.getItem(key) || Math.floor(Math.random() * 40) + 15);
    let curtido = localStorage.getItem(keyCurtido) === 'true';

    likesCount.textContent = count;
    const heartIcon = btnCurtir.querySelector('i');
    if (curtido) {
        heartIcon.className = 'fa-solid fa-heart';
        btnCurtir.classList.add('curtido');
    }

    btnCurtir.addEventListener('click', () => {
        curtido = !curtido;
        if (curtido) {
            count++;
            heartIcon.className = 'fa-solid fa-heart';
            btnCurtir.classList.add('curtido');
        } else {
            count--;
            heartIcon.className = 'fa-regular fa-heart';
            btnCurtir.classList.remove('curtido');
        }

        localStorage.setItem(key, count);
        localStorage.setItem(keyCurtido, curtido);
        likesCount.textContent = count;

        // Feedback de escala
        btnCurtir.style.transform = 'scale(1.2)';
        setTimeout(() => {
            btnCurtir.style.transform = '';
        }, 150);
    });
}

function configurarCompartilhar(noticia) {
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    if (!btnCompartilhar) return;

    btnCompartilhar.addEventListener('click', async () => {
        const url = window.location.href;
        const titulo = noticia.titulo;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: titulo,
                    text: noticia.resumo || '',
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                mostrarToast('Link copiado para a área de transferência! 🔗');
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    });
}

function mostrarToast(mensagem) {
    let toast = document.getElementById('materia-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'materia-toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = 'var(--text-color)';
        toast.style.color = 'var(--bg-color)';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        document.body.appendChild(toast);
    }

    toast.textContent = mensagem;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}

async function carregarRelacionadas(materiaAtual) {
    const grid = document.getElementById('relacionadas-grid');
    if (!grid) return;

    try {
        const response = await fetch('/api/publicacoes');
        const json = await response.json();
        const dados = json.dados || json;

        if (!dados || dados.length === 0) return;

        // Filtrar matérias relacionadas (mesmo tema ou gênero, excluindo a atual)
        let relacionadas = dados.filter(p => 
            p.id !== materiaAtual.id && 
            (p.tema_principal_id === materiaAtual.tema_principal_id || p.genero_id === materiaAtual.genero_id)
        );

        // Se houver poucas, pega qualquer outra
        if (relacionadas.length < 3) {
            relacionadas = dados.filter(p => p.id !== materiaAtual.id);
        }

        // Embaralhar e pegar no máximo 3
        relacionadas.sort(() => Math.random() - 0.5);
        const selecionadas = relacionadas.slice(0, 3);

        grid.innerHTML = '';
        selecionadas.forEach(noticia => {
            const card = criarCardRelacionada(noticia);
            grid.appendChild(card);
        });

    } catch (err) {
        console.error('Erro ao carregar matérias relacionadas:', err);
    }
}

function criarCardRelacionada(noticia) {
    const card = document.createElement('article');
    card.className = 'relacionada-card';

    let imgSrc = 'src/images/foto-sesi.jpg';
    if (noticia.imagem_destaque) {
        imgSrc = noticia.imagem_destaque.startsWith('http') || noticia.imagem_destaque.startsWith('src/')
            ? noticia.imagem_destaque 
            : `/uploads/${noticia.imagem_destaque}`;
    }

    const categoriaInfo = obterCategoriaInfo(noticia);

    card.innerHTML = `
        <div class="relacionada-img-wrap">
            <img src="${imgSrc}" alt="${noticia.titulo}" class="relacionada-img" />
        </div>
        <div class="relacionada-content">
            <span class="relacionada-tag">${noticia.tema_principal_nome || noticia.genero_nome || categoriaInfo.nome}</span>
            <h3 class="relacionada-card-titulo">
                <a href="materia.html?id=${noticia.id}">${noticia.titulo}</a>
            </h3>
            <span class="relacionada-date">${formatarData(noticia.data_publicacao || noticia.data_criacao)}</span>
        </div>
    `;

    return card;
}

function exibirErro(mensagem) {
    const artigo = document.getElementById('materia-artigo');
    if (artigo) {
        artigo.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--primary-color);">
                <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h2>Ops!</h2>
                <p>${mensagem}</p>
                <a href="index.html" class="footer__btn" style="display: inline-block; margin-top: 20px; text-decoration: none;">Voltar para o Início</a>
            </div>
        `;
    }
}
