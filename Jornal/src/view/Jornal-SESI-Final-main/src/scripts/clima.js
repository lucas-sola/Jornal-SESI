document.addEventListener('DOMContentLoaded', () => {
    renderizarPesquisa()
    renderizarMain(cidadeMain)
    cidadesFixas.forEach(renderizarMini)
})

const cidadeMain = {
    name: 'Salto, SP',
    lat: -23.2009,
    lon: -47.2925
}

const cidadesFixas = [
    { id: 'cardSP', name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
    { id: 'cardRJ', name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
    { id: 'cardBH', name: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
    { id: 'cardBSB', name: 'Brasília', lat: -15.7797, lon: -47.9297 },
]

/* ──────────────────────── CONSTs para APOIO ──────────────────────── */

const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/* ──────────────────────── UTILITÁRIOS ──────────────────────── */

function infoClima(code) {
    const mapa = {
        0: ['☀️', 'Céu Limpo'],
        1: ['🌤️', 'Quase Limpo'],
        2: ['⛅', 'Parcialmente Nublado'],
        3: ['☁️', 'Nublado'],
        45: ['🌫️', 'Neblina'],
        48: ['🌫️', 'Neblina c/ Geada'],
        51: ['🌦️', 'Chuvisco Fraco'],
        53: ['🌦️', 'Chuvisco Moderado'],
        55: ['🌧️', 'Chuvisco Intenso'],
        61: ['🌧️', 'Chuva Fraca'],
        63: ['🌧️', 'Chuva Moderada'],
        65: ['🌧️', 'Chuva Forte'],
        71: ['❄️', 'Neve Fraca'],
        73: ['❄️', 'Neve Moderada'],
        75: ['❄️', 'Neve Intensa'],
        77: ['🌨️', 'Granizo'],
        80: ['🌦️', 'Pancada Fraca'],
        81: ['⛈️', 'Pancada Moderada'],
        82: ['⛈️', 'Pancada Forte'],
        95: ['⛈️', 'Tempestade'],
        96: ['⛈️', 'Tempestade c/ Granizo'],
        99: ['⛈️', 'Tempestade Severa'],
    }

    const achou = mapa[code] ?? ['🌡️', 'Desconhecido']
    return { icon: achou[0], desc: achou[1] }
}

function formatarAgora() {
    const data = new Date()
    const horas = String(data.getHours()).padStart(2, '0')
    const minutos = String(data.getMinutes()).padStart(2, '0')

    return `${dias[data.getDay()]}, ${data.getDate()} ${meses[data.getMonth()]}- ${horas}:${minutos}`
}

function horaAgora() {
    const data = new Date()
    const horas = String(data.getHours()).padStart(2, '0')
    const minutos = String(data.getMinutes()).padStart(2, '0')

    return `${dias[data.getDay()]} ${horas}:${minutos}`
}

function horaLabel(isoStr) {
    const horas = new Date(isoStr).getHours()
    if (horas === 0) return '12 AM'
    if (horas === 12) return '12 PM'

    return horas < 12 ? `${horas} AM` : `${horas - 12} PM`
}

function diaAbreviacao(dateStr) {
    return dias[new Date(dateStr + 'T12:00:00').getDay()]
}

function horaAtualIndex(w) {
    const prefixo = w.current_weather.time.slice(0, 13)
    const index = w.hourly.time.findIndex(t => t.startsWith(prefixo))

    return index >= 0 ? index : 0
}

function buildPontosGraficos(w) {
    const alvos = [5, 8, 11, 14, 17, 20, 23, 2]
    const hoje = new Date().toISOString().slice(0, 10)
    const amanha = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    const pontos = []

    for (const horas of alvos) {
        const data = horas === 2 ? amanha : hoje
        const needle = `${data}T${String(horas).padStart(2, '0')}:00`
        const index = w.hourly.time.indexOf(needle);
        if (index !== -1) {
            pontos.push({ label: horaLabel(needle), temp: Math.round(w.hourly.temperature_2m[index]) })
        }
    }

    if (pontos.length < 4) {
        return w.hourly.time.slice(0, 24)
            .filter((_, i) => i % 3 === 0)
            .map((t, i) => ({ label: horaLabel(t), temp: Math.round(w.hourly.temperature_2m[i * 3]) }));
    }

    return pontos
}

/* ──────────────────────── APIs ──────────────────────── */

async function codigoGeografico(query) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=pt&format=json`

    const resultado = await fetch(url)
    const data = await resultado.json()

    if (!data.results?.length) throw new Error(`Cidade não encontrada: "${query}`);

    const r = data.results[0]
    return {
        lat: r.latitude,
        lon: r.longitude,
        name: [r.name, r.admin1].filter(Boolean).join(', ')
    }
}

async function fetchClima(lat, lon) {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    Object.entries({
        latitude: lat,
        longitude: lon,
        hourly: 'temperature_2m,precipitation_probability,relative_humidity_2m,windspeed_10m,weathercode',
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        current_weather: 'true',
        timezone: 'auto',
        forecast_days: 8
    }).forEach(([k, v]) => url.searchParams.set(k, v))
    const resultado = await fetch(url)
    return resultado.json()
}

/* ──────────────────────── GRÁFICO ──────────────────────── */

let graficoInstancia = null

function desenharGrafico(id, labelId, pontos) {
    const tela = document.querySelector(`#${id}`)

    if (!tela) return

    const telaContexto = tela.getContext('2d')
    const gradiente = telaContexto.createLinearGradient(0, 0, 0, 130)

    gradiente.addColorStop(0, 'rgba(232, 200, 74, 0.18)')
    gradiente.addColorStop(0.5, 'rgba(232, 200, 74, 0.06)')
    gradiente.addColorStop(1, 'rgba(232, 200, 74, 0)')

    if (graficoInstancia) graficoInstancia.destroy();

    graficoInstancia = new Chart(telaContexto, {
        type: 'line',
        data: {
            labels: pontos.map(p => p.label),
            datasets: [{
                data: pontos.map(p => p.temp),

                borderColor: '#e8c84a',
                borderWidth: 2.5,

                pointRadius: 4,
                pointBackgroundColor: '#e8c84a',
                pointBorderWidth: 2,

                tension: 0.4, // 0 = reto | 1 = muito curvado

                fill: true,
                backgroundColor: gradiente,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#00897B',
                    borderColor: '#002420',
                    borderWidth: 1,
                    titleColor: '#e8c84a',
                    bodyColor: '#ffffff',
                    callbacks: { label: c => ` ${c.parsed.y}ºC` },
                },
            },
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    grid: { color: '#00897b44' },
                    border: { display: false },
                    ticks: {
                        color: 'rgba(6, 214, 127, 0.49)',
                        font: { family: `Neue Montreal`, size: 10 },
                        callback: value => `${value}°`,
                    },
                },
            },
        },
    })

    const labelsEl = document.querySelector(`#${labelId}`)
    if (labelsEl) {
        labelsEl.innerHTML = pontos.map(p => `<span>${p.label}</span>`).join('');
    }
}

/* ──────────────────────── MAIN CARD ──────────────────────── */

async function renderizarMain(cidadeInput) {
    const card = document.querySelector(`.main-card`)
    card.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Carregando...</span></div>'

    try {
        const geo = typeof cidadeInput === 'object' ? cidadeInput : await codigoGeografico(cidadeInput)

        const clima = await fetchClima(geo.lat, geo.lon)
        const climaAtual = clima.current_weather
        const info = infoClima(climaAtual.weathercode)
        const horaIndex = horaAtualIndex(clima)

        const precipitacao = clima.hourly.precipitation_probability[horaIndex] ?? 0
        const umidade = clima.hourly.relative_humidity_2m[horaIndex] ?? 0
        const vento = Math.round(climaAtual.windspeed)
        const hoje = new Date().toISOString().slice(0, 10)
        const graficoPontos = buildPontosGraficos(clima)

        const semanaHtml = clima.daily.time.slice(0, 8).map((dateStr, i) => {
            const eHoje = dateStr === hoje
            const di = infoClima(clima.daily.weathercode[i])
            const hi = Math.round(clima.daily.temperature_2m_max[i])
            const lo = Math.round(clima.daily.temperature_2m_min[i])
            return `
        <div class="day-pill ${eHoje ? 'is-today' : ''}">
            <span class="day-pill__name">${diaAbreviacao(dateStr)}</span>
            <span class="day-pill__icon">${di.icon}</span>
            <span class="day-pill__temps">
                <span class="day-pill__hi">${hi}°</span>
                <span class="day-pill__lo"> /${lo}°</span>
            </span>
        </div>`
        }).join('')

        card.innerHTML = `<div class="mc-top fade-in">
            <div class="mc-left">
            <span class="mc-icon">${info.icon}</span>
            <div>
                <div class="mc-temp">${Math.round(climaAtual.temperature)}<sup>°C</sup></div>
                <div class="mc-desc">${info.desc}</div>
            </div>
            </div>
            <div class="mc-right">
            <div class="mc-city">${geo.name}</div>
            <div class="mc-time">${formatarAgora()}</div>
            </div>
        </div>

        <div class="mc-meta fade-in">
            <div class="mc-meta__item"><em>🌧️</em> Precipitação: ${precipitacao}%</div>
            <div class="mc-meta__item"><em>💧</em> Umidade: ${umidade}%</div>
            <div class="mc-meta__item"><em>💨</em> Vento: ${vento} km/h</div>
        </div>

        <div class="mc-chart fade-in">
            <canvas id="tempChart"></canvas>
        </div>
        <div class="mc-chart-labels" id="chartLabels"></div>

        <div class="mc-week fade-in">${semanaHtml}</div>`

        desenharGrafico('tempChart', 'chartLabels', graficoPontos)
    } catch (erro) {
        card.innerHTML = `
        <div class="loading-state" style="flex-direction: column; gap: 8px; color: #f87171">
            <span style="font-size: 30px">⚠️</span>
            <span>${erro.message}</span>
        </div>`
    }
}

/* ──────────────────────── MINI CARD ──────────────────────── */

async function renderizarMini(cidade) {
    const card = document.querySelector(`#${cidade.id}`)
    if (!card) return

    try {
        const clima = await fetchClima(cidade.lat, cidade.lon)
        const climaAtual = clima.current_weather
        const info = infoClima(climaAtual.weathercode)
        const horaIndex = horaAtualIndex(clima)

        const precipitacao = clima.hourly.precipitation_probability[horaIndex] ?? 0
        const umidade = clima.hourly.relative_humidity_2m[horaIndex] ?? 0
        const vento = Math.round(climaAtual.windspeed)

        card.innerHTML = `<div class="mc2-top fade-in">
        <div class="mc2-meta">
          Precipitação: ${precipitacao}%<br>
          Umidade: ${umidade}%<br>
          Vento: ${vento} km/h
        </div>
        <div class="mc2-right">
          <div class="mc2-name">${cidade.name}</div>
          <div class="mc2-time">${horaAgora()}</div>
        </div>
      </div>
      <div class="mc2-bottom fade-in">
        <span class="mc2-icon">${info.icon}</span>
        <span class="mc2-temp">${Math.round(climaAtual.temperature)}<sup>°C</sup></span>
      </div>`
    } catch (error) {
        card.innerHTML = `
        <div class="loading-state loading-state--sm" style="color:rgba(255,255,255,.45);font-size:12px;">
            Erro ao carregar
        </div>`
    }
}


/* ──────────────────────── BUSCA ──────────────────────── */

function handlePesquisa() {
    const input = document.querySelector('#pesquisaInput')
    const query = input.value.trim()
    if (query) renderizarMain(query)
}

function renderizarPesquisa() {
    const btnPesquisa = document.querySelector('#pesquisaBtn')
    const input = document.querySelector('#pesquisaInput')

    btnPesquisa.addEventListener('click', handlePesquisa)
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') handlePesquisa()
    })
}