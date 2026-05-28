<div align="center">

# 📰 Revista SESI

### Site Jornalístico — 3º ano B · SENAI/SESI · 2026

Projeto prático de desenvolvimento web que simula uma **revista digital** com notícias, clima em tempo real, tema escuro e interatividade completa.

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

</div>

---

## ✨ Funcionalidades

- 🗞️ **Hero Section** — manchete principal com data dinâmica via JavaScript
- 📋 **Grid de Notícias** — notícia em destaque + sidebar com matérias secundárias
- ☁️ **Widget de Clima** — temperatura em tempo real via API, gráfico de linha (Chart.js) e busca de cidades
- 🌙 **Tema Escuro / Claro** — alternância com preferência salva no `localStorage`
- 🍔 **Menu Hambúrguer** — navegação mobile com animação de abertura/fechamento
- 🔍 **Barra de Pesquisa** — comportamento adaptado para mobile e desktop
- 📬 **Footer completo** — coluna de marca, navegação rápida e formulário "Envie seus textos"

---

## 🗂️ Estrutura de Arquivos

```
📁 Site SESI/
├── index.html
├── postagem.html
└── src/
    ├── fonts/
    │   ├── NeueMontreal-Regular.otf
    │   └── CollegiateFLF.ttf
    ├── images/
    │   ├── foto-sesi.jpg
    │   ├── logo-revista.png
    │   ├── noticias/
    │   ├── cidades/
    │   └── imagens-links/
    └── styles/
    │   ├── root.css        # Variáveis globais, fontes e reset
    │   ├── header.css      # Header, menu mobile e barra de pesquisa
    │   ├── main.css        # Hero, grid de notícias e sidebar
    │   ├── clima.css       # Widget de clima e gráfico
    │   ├── postagem.css    # Estilos do postagem.html
    │   └── footer.css      # Footer com formulário
    └── scripts/
        ├── postagem.js     # Scripts do postagem.html
        ├── main.js         # Scripts do index.html
        ├── global.js       # Header e Footer globais
        └── clima.js        # Integração com API de clima e Chart.js
```

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica das páginas |
| **CSS3 Vanilla** | Estilização com variáveis CSS, Grid, Flexbox e animações |
| **JavaScript (ES6+)** | Interatividade, DOM e chamadas de API |
| **[Chart.js](https://www.chartjs.org/)** | Gráfico de temperatura no widget de clima |
| **[Font Awesome 6](https://fontawesome.com/)** | Ícones (sociais, busca, formulário) |
| **Fonte: Neue Montreal** | Tipografia principal do projeto |
| **Fonte: Collegiate** | Tipografia secundária/display |

---

## 🎨 Design

| | Claro | Escuro |
|---|---|---|
| **Fundo** | `#FAF9F6` | `#0b0d12` |
| **Texto** | `#22282A` | Variáveis sobrescritas via `body.dark-theme` |
| **Primária** | `#00897B` (verde-teal) | `#00897B` |

Suporte completo a **dark mode** com transição suave entre os temas.

---

## 🚀 Como Rodar

Por ser um projeto **HTML/CSS/JS puro**, não é necessária nenhuma instalação.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/revista-sesi.git

# 2. Acesse a pasta
cd revista-sesi

# 3. Abra o index.html no navegador
```

---

## 👥 Equipe

Desenvolvido com pelos alunos do **3º ano B — SENAI/SESI**  

<br>

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/Rafael75801">
        <img src="https://github.com/Rafael75801.png" width="80px" style="border-radius:50%" alt="Avatar 1º membro da equipe - Rafael Teixeira"/><br/>
        <sub><b>Rafael Teixeira</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/lucas-sola">
        <img src="https://github.com/lucas-sola.png" width="80px" style="border-radius:50%" alt="Avatar 2º membro da equipe - Lucas Sola"/><br/>
        <sub><b>Lucas Felipe Sola</b></b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/enzo-antonio">
        <img src="https://github.com/enzo-antonio.png" width="80px" style="border-radius:50%" alt="Avatar 3º membro da equipe - Enzo Antônio"/><br/>
        <sub><b>Enzo Antônio Ferreira de Araújo</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/RafaelF2309">
        <img src="https://github.com/RafaelF2309.png" width="80px" style="border-radius:50%" alt="Avatar 4º membro da equipe - Rafael Ferreira"/><br/>
        <sub><b>Rafael Ferreira da Silva</b></sub>
      </a>
    </td>
  </tr>
</table>
