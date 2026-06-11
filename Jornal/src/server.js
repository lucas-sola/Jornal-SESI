const app = require('./app');
const pool = require('./config/database');

const PORT = 3000;

async function inicializarEsportes() {
    try {
        // 1. Verificar se o tema 'Esportes' existe em temas_principais
        const [temas] = await pool.query("SELECT id FROM temas_principais WHERE nome = 'Esportes'");
        let temaId;
        if (temas.length === 0) {
            const [result] = await pool.query("INSERT INTO temas_principais (nome, descricao) VALUES ('Esportes', 'Competições escolares, projetos de vida saudável e conquistas de atletas.')");
            temaId = result.insertId;
        } else {
            temaId = temas[0].id;
        }

        // 2. Inserir as matérias de esportes se não existirem
        const [publicacoes] = await pool.query("SELECT id FROM publicacao WHERE tema_principal_id = ?", [temaId]);
        if (publicacoes.length === 0) {
            const materias = [
                {
                    titulo: 'Interclasses SESI 2026: Emoção e integração',
                    conteudo: 'O campeonato interclasses deste ano começou com tudo! Alunos de todas as séries se reuniram para disputar as modalidades de futsal, voleibol e handebol, promovendo a integração e o espírito esportivo na escola. As arquibancadas ficaram lotadas todos os dias, com torcidas organizadas vibrando a cada lance. A final do futsal masculino do 3º ano foi o ponto alto da semana, decidida nos pênaltis em uma atmosfera eletrizante. O diretor elogiou a conduta ética dos alunos e destacou a importância de eventos esportivos para a formação integral e o desenvolvimento da empatia e cooperação entre os jovens.',
                    resumo: 'O campeonato interclasses deste ano começou com tudo! Alunos de todas as séries se reuniram para disputar futsal, voleibol e handebol.',
                    data_criacao: '2026-06-02',
                    data_publicacao: '2026-06-02',
                    autor_id: 1, // Adrian Clarck
                    genero_id: 8, // Reportagem
                    tema_principal_id: temaId,
                    imagem_destaque: 'src/images/imagens-links/pacaembu.jpg'
                },
                {
                    titulo: 'Benefícios da prática esportiva na adolescência',
                    conteudo: 'Especialistas em educação física debatem os impactos positivos do esporte na saúde mental dos jovens. Além de melhorar a condição física, o esporte reduz o estresse e melhora o desempenho acadêmico em sala de aula. Estudos recentes mostram que adolescentes que praticam atividades físicas regularmente apresentam índices significativamente menores de ansiedade e depressão. No ambiente escolar, a prática de esportes coletivos também estimula habilidades de comunicação, liderança e resiliência, essenciais para o mercado de trabalho e para a vida adulta.',
                    resumo: 'Especialistas debatem os impactos positivos do esporte na saúde mental dos jovens e na redução do estresse.',
                    data_criacao: '2026-05-20',
                    data_publicacao: '2026-05-20',
                    autor_id: 2, // Andrew Clarck
                    genero_id: 9, // Artigo de Opinião
                    tema_principal_id: temaId,
                    imagem_destaque: 'src/images/foto-sesi.jpg'
                },
                {
                    titulo: 'Nova quadra poliesportiva é entregue na unidade',
                    conteudo: 'A entrega da nova quadra contou com uma partida amistosa de basquete entre professores e estudantes. O espaço agora conta com iluminação LED de última geração e piso emborrachado para melhor amortecimento, reduzindo o risco de lesões. Com essa nova estrutura, a escola pretende ampliar a oferta de modalidades esportivas nas aulas de educação física e também em projetos extracurriculares. Os alunos comemoraram a inauguração, destacando que a nova quadra motivará ainda mais a participação nos treinos escolares.',
                    resumo: 'A nova quadra conta com iluminação LED de última geração e piso emborrachado para amortecimento.',
                    data_criacao: '2026-05-10',
                    data_publicacao: '2026-05-10',
                    autor_id: 3, // Eduardo Chaves
                    genero_id: 13, // Informativo Institucional
                    tema_principal_id: temaId,
                    imagem_destaque: 'src/images/imagens-links/pacaembu.jpg'
                }
            ];

            for (const materia of materias) {
                await pool.query("INSERT INTO publicacao SET ?", [materia]);
            }
            console.log('Matérias de Esportes inicializadas no banco de dados com sucesso! 🏆');
        }
    } catch (err) {
        console.error('Erro ao inicializar matérias de Esportes:', err);
    }
}

async function start() {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado ao MySQL com sucesso! 🎉');
        connection.release();

        await inicializarEsportes();
    } catch (err) {
        console.error('Erro ao conectar no banco:', err);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}

start();