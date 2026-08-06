/**
 * Separa um bloco de texto contínuo em parágrafos no estilo jornalístico
 * (ex.: Folha de S.Paulo): blocos curtos de ~2 frases, com quebra após perguntas.
 *
 * Se o autor já inseriu quebras de linha, elas são respeitadas.
 *
 * @param {string} texto
 * @returns {string[]}
 */
function separarEmParagrafos(texto) {
    const textoLimpo = (texto || '').trim()
    if (!textoLimpo) return []

    if (textoLimpo.includes('\n')) {
        return textoLimpo.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    }

    const sentencas = extrairSentencas(textoLimpo)
    if (!sentencas.length) return [textoLimpo]

    const paragrafos = []
    let buffer = []
    const sentencasPorParagrafo = 2

    for (const sentenca of sentencas) {
        buffer.push(sentenca)

        const ultima = sentenca.trim()
        const terminaComInterrogacao = ultima.endsWith('?')
        const bufferCheio = buffer.length >= sentencasPorParagrafo

        if (terminaComInterrogacao || bufferCheio) {
            paragrafos.push(buffer.join(' '))
            buffer = []
        }
    }

    if (buffer.length) {
        paragrafos.push(buffer.join(' '))
    }

    return paragrafos
}

/**
 * @param {string} texto
 * @returns {string[]}
 */
function extrairSentencas(texto) {
    const sentencas = []
    let atual = ''

    for (let i = 0; i < texto.length; i++) {
        atual += texto[i]
        const char = texto[i]
        const anterior = texto[i - 1]
        const proximo = texto[i + 1]

        if (char !== '.' && char !== '?' && char !== '!') continue

        if (char === '.' && /\d/.test(anterior)) continue
        if (char === '.' && proximo && proximo !== ' ' && proximo !== '\n') continue

        if (!proximo || proximo === ' ' || proximo === '\n') {
            const trecho = atual.trim()
            if (trecho) sentencas.push(trecho)
            atual = ''
            while (texto[i + 1] === ' ') i++
        }
    }

    const resto = atual.trim()
    if (resto) sentencas.push(resto)

    return sentencas
}

/**
 * Renderiza parágrafos dentro de um container.
 *
 * @param {HTMLElement} container
 * @param {string} texto
 * @param {string} className
 * @param {string} [vazioMsg]
 */
function renderizarParagrafos(container, texto, className, vazioMsg = 'Conteúdo indisponível.') {
    container.innerHTML = ''
    const paragrafos = separarEmParagrafos(texto)

    if (!paragrafos.length) {
        const p = document.createElement('p')
        p.className = className
        p.textContent = vazioMsg
        container.appendChild(p)
        return
    }

    paragrafos.forEach((pTexto) => {
        const p = document.createElement('p')
        p.className = className
        p.textContent = pTexto
        container.appendChild(p)
    })
}
