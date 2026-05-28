document.addEventListener('DOMContentLoaded', function () {
    formatarHero()
})


/* ─── JavaScript Main ───────────────────────────────────────────────────── */
function formatarHero(){
    const tituloHero = document.querySelector('.hero-content .titulo')
    tituloHero.textContent = 'Jornal do 3ºB fica com o Frontend pronto!'

    const subtituloHero = document.querySelector('.hero-content .subtitulo')
    subtituloHero.textContent = 'Em um trabalho conjunto da professora de português, os alunos do 3ºB terminam a parte visual do jornal!'

    const data = new Date()
    
    const opcoesData = {
        day: 'numeric',
        month: 'long'
    }

    const diaMes = data.toLocaleDateString('pt-BR', opcoesData)
    const anoAtual = data.getFullYear()
    const dataPublicacao = document.querySelector('#ano-hero');
    dataPublicacao.innerHTML = `${diaMes}, ${anoAtual}`

    const alunoHero = document.querySelector('#aluno-hero')
    alunoHero.textContent = 'Equipe de Desenvolvimento do 3ºB'
}

async function carregarPublicacoes() {
    try {
        const response = await fetch('/api/publicacoes');
        const dados = await response.json();

        if (dados.length > 0) {
            const ultima = dados[0];
            const hero = document.querySelector(".hero-content");
            hero.querySelector('.titulo').textContent = ultima.titulo;
            hero.querySelector('.subtitulo').textContent = ultima.resumo || ultima.subtituloHero;
            document.querySelector('#ano-hero').textContent = formatarData(ultima.data_publicacao || new Date());

            if (dados.length > 1) {
                const destaque = dados[1];
                const secDestaque = document.querySelector('.noticia-principal');
                secDestaque.querySelector('.titulo').textContent = destaque.titulo;
                secDestaque.querySelector('.noticia-destaque-descricao').textContent = destaque.resumo || destaque.conteudo.substring(0, 200) + '...';
                if (destaque.capa) {
                    secDestaque.querySelector('.noticia-destaque-imagem').src = `/uploads/${destaque.capa}`;
                }
            }

            const sidebar = document.querySelector('.noticia-principal-sidebar');
            const noticiasSidebar = dados.slice(2, 5);
            
 
            const sideCards = sidebar.querySelectorAll('.noticia-sidebar');
            noticiasSidebar.forEach((noticia, index) => {
                if (sideCards[index]) {
                    sideCards[index].querySelector('.titulo').textContent = noticia.titulo;
                    sideCards[index].querySelector('.descricao-sidebar').textContent = noticia.resumo || noticia.conteudo.substring(0, 150) + '...';
                }
            });
        }
    } catch (error) {
        console.error('Erro ao carregar publicações:', error);
    }
}

function formatarData(dataStr) {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

document.addEventListener('DOMContentLoaded', () => {
    formatarHero();
    carregarPublicacoes();
});