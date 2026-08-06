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

function obterTagsPublicacao(noticia) {
    const tags = [];
    const categoriaInfo = obterCategoriaInfo(noticia);

    if (categoriaInfo?.nome) tags.push(categoriaInfo.nome);
    if (noticia.tema_principal_nome) tags.push(noticia.tema_principal_nome);
    if (noticia.genero_nome) tags.push(noticia.genero_nome);

    return [...new Set(tags.filter(Boolean))];
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
        const dataTexto = formatarData(noticia.data_publicacao || noticia.data_criacao);
        dataEl.innerHTML = noticia.editado ? `${dataTexto} <span class="materia-editada-label">(editado)</span>` : dataTexto;
    }

    const usuarioLogado = obterUsuarioLogado();
    const botoesAutor = document.getElementById('materia-botoes-autor');
    if (botoesAutor) {
        const eAutor = usuarioLogado && usuarioLogado.id === noticia.autor_id;
        botoesAutor.classList.toggle('active', Boolean(eAutor));
        if (eAutor) configurarBotoesAutor(noticia);
    }

    // Imagem
    const imgEl = document.getElementById('materia-imagem');
    const legendaEl = document.getElementById('materia-legenda');
    const imgWrap = document.getElementById('materia-imagem-wrap');

    if (imgEl) {
        const imgMateriaPadrao = 'src/images/foto-sesi.jpg';
        if (noticia.imagem_destaque) {
            imgEl.src = resolverImagemPublicacao(noticia.imagem_destaque, imgMateriaPadrao);
            imgEl.alt = noticia.titulo;
            aplicarFallbackImagem(imgEl, imgMateriaPadrao);
            if (legendaEl) {
                legendaEl.textContent = noticia.subtitulo || '';
            }
        } else {
            // Se não tiver imagem, podemos ocultar o wrap ou usar uma padrão
            imgEl.src = imgMateriaPadrao;
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
        renderizarParagrafos(corpoEl, noticia.conteudo, 'materia-paragrafo');
        animarEntrada(corpoEl.querySelectorAll('.materia-paragrafo'), { delay: 55 });
    }

    // Tags inferiores
    const tagsContainer = document.getElementById('materia-tags');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        obterTagsPublicacao(noticia).forEach((tagText) => {
            const span = document.createElement('span');
            span.className = 'materia-tag-chip';
            span.innerHTML = `<i class="fa-solid fa-tag" aria-hidden="true"></i>${tagText}`;
            tagsContainer.appendChild(span);
        });
    }

    animarSecoes([
        document.getElementById('materia-hero'),
        document.getElementById('materia-imagem-wrap'),
        document.getElementById('materia-resumo'),
        corpoEl,
        tagsContainer,
    ].filter(Boolean));

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

    let count = parseInt(localStorage.getItem(key) || 0);
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
                mostrarToast('Link copiado para a área de transferência!');
            }
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    });
}

function mostrarToast(mensagem, type = 'success') {
    showToast(mensagem, type);
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

        animarEntrada(grid.querySelectorAll('.post-card'), { delay: 100 });

    } catch (err) {
        console.error('Erro ao carregar matérias relacionadas:', err);
    }
}

function criarCardRelacionada(noticia) {
    const card = document.createElement('article');
    card.className = 'post-card';

    const imgPadraoRelacionada = 'src/images/foto-sesi.jpg';
    const imgSrc = resolverImagemPublicacao(noticia.imagem_destaque, imgPadraoRelacionada);

    const categoriaInfo = obterCategoriaInfo(noticia);
    const tag = noticia.tema_principal_nome || noticia.genero_nome || categoriaInfo.nome;
    const resumo = noticia.resumo || (noticia.conteudo ? noticia.conteudo.substring(0, 120) + '...' : '');
    const autor = noticia.autor_nome || 'Equipe SESI';
    const dataFormatada = formatarData(noticia.data_publicacao || noticia.data_criacao);

    card.innerHTML = `
        <div class="post-card-img-wrap">
            <img src="${imgSrc}" alt="${noticia.titulo}" class="post-card-img" />
        </div>
        <div class="post-card-content">
            <span class="post-card-tag">${tag}</span>
            <h3 class="post-card-title">
                <a href="materia.html?id=${noticia.id}">${noticia.titulo}</a>
            </h3>
            <p class="post-card-excerpt">${resumo}</p>
            <div class="post-card-footer">
                <span class="post-card-author">Por: ${autor}</span>
                <span>${dataFormatada}</span>
            </div>
        </div>
    `;

    aplicarFallbackImagem(card.querySelector('.post-card-img'), imgPadraoRelacionada);

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

function obterUsuarioLogado() {
    try {
        return JSON.parse(localStorage.getItem('sesiUsuario'));
    } catch {
        return null;
    }
}

function configurarBotoesAutor(noticia) {
    const modalEditar = document.getElementById('modal-editar');
    const formEditar = document.getElementById('form-editar-publicacao');
    const btnEditar = document.getElementById('btn-editar');
    const btnDeletar = document.getElementById('btn-deletar');
    const btnFechar = document.getElementById('btn-fechar-modal');
    const btnCancelar = document.getElementById('btn-cancelar-edicao');

    const toggleModal = (abrir) => modalEditar?.classList.toggle('active', abrir);

    if (btnEditar) {
        btnEditar.addEventListener('click', () => {
            document.getElementById('edit-titulo').value = noticia.titulo || '';
            document.getElementById('edit-subtitulo').value = noticia.subtitulo || '';
            document.getElementById('edit-resumo').value = noticia.resumo || '';
            document.getElementById('edit-conteudo').value = noticia.conteudo || '';
            toggleModal(true);
        });
    }

    if (btnFechar) btnFechar.addEventListener('click', () => toggleModal(false));
    if (btnCancelar) btnCancelar.addEventListener('click', () => toggleModal(false));

    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usuario = obterUsuarioLogado();
            if (!usuario?.id) return;

            const payload = {
                titulo: document.getElementById('edit-titulo').value.trim(),
                subtitulo: document.getElementById('edit-subtitulo').value.trim(),
                resumo: document.getElementById('edit-resumo').value.trim(),
                conteudo: document.getElementById('edit-conteudo').value.trim()
            };

            try {
                const response = await fetch(`/api/publicacoes/${noticia.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Usuario-Id': String(usuario.id)
                    },
                    body: JSON.stringify(payload)
                });
                const json = await response.json();

                if (response.ok && json.sucesso) {
                    showToast('Matéria atualizada com sucesso!', 'success');
                    setTimeout(() => window.location.reload(), 1400);
                } else {
                    showToast(json.erro || 'Erro ao atualizar a matéria.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao atualizar publicação.', 'error');
            }
        });
    }

    if (btnDeletar) {
        btnDeletar.addEventListener('click', async () => {
            const confirmado = await showConfirm(
                'Deseja realmente excluir esta matéria permanentemente?',
                { title: 'Excluir matéria', confirmText: 'Excluir', danger: true }
            );
            if (!confirmado) return;
            const usuario = obterUsuarioLogado();
            if (!usuario?.id) return;

            try {
                const response = await fetch(`/api/publicacoes/${noticia.id}`, {
                    method: 'DELETE',
                    headers: { 'X-Usuario-Id': String(usuario.id) }
                });
                const json = await response.json();

                if (response.ok && json.sucesso) {
                    showToast('Matéria excluída com sucesso!', 'success');
                    setTimeout(() => { window.location.href = 'index.html'; }, 1400);
                } else {
                    showToast(json.erro || 'Erro ao excluir a matéria.', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Erro ao excluir publicação.', 'error');
            }
        });
    }
}