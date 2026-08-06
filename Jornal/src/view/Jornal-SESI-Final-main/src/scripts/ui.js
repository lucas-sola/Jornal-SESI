const UI_ICONS = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
    confirm: '?',
    alert: 'i',
}

let uiToastStack = null
let uiModalRoot = null

function initUiPortal() {
    if (!uiToastStack) {
        uiToastStack = document.createElement('div')
        uiToastStack.className = 'ui-toast-stack'
        uiToastStack.setAttribute('aria-live', 'polite')
        uiToastStack.setAttribute('aria-atomic', 'false')
        document.body.appendChild(uiToastStack)
    }

    if (!uiModalRoot) {
        uiModalRoot = document.createElement('div')
        uiModalRoot.id = 'ui-modal-root'
        document.body.appendChild(uiModalRoot)
    }
}

/**
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'|''} [type]
 * @param {number} [duration=3200]
 */
function showToast(message, type = 'info', duration = 3200) {
    initUiPortal()

    const toastType = type || 'info'
    const toast = document.createElement('div')
    toast.className = `ui-toast ui-toast--${toastType}`
    toast.innerHTML = `
        <span class="ui-toast__icon" aria-hidden="true">${UI_ICONS[toastType] || UI_ICONS.info}</span>
        <div class="ui-toast__body">
            <p class="ui-toast__message">${escapeHtml(message)}</p>
        </div>
        <button type="button" class="ui-toast__close" aria-label="Fechar">&times;</button>
    `

    const closeBtn = toast.querySelector('.ui-toast__close')
    let timer = null

    const dismiss = () => {
        if (timer) clearTimeout(timer)
        toast.classList.remove('ui-toast--visible')
        toast.classList.add('ui-toast--leaving')
        setTimeout(() => toast.remove(), 350)
    }

    closeBtn.addEventListener('click', dismiss)
    uiToastStack.appendChild(toast)

    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('ui-toast--visible'))
    })

    if (duration > 0) {
        timer = setTimeout(dismiss, duration)
    }

    return { dismiss }
}

/**
 * @param {string} message
 * @param {{ title?: string, type?: string, confirmText?: string }} [options]
 * @returns {Promise<void>}
 */
function showAlert(message, options = {}) {
    const {
        title = 'Aviso',
        type = 'alert',
        confirmText = 'Entendi',
    } = options

    return new Promise((resolve) => {
        openModal({
            title,
            message,
            type,
            confirmText,
            cancelText: null,
            onConfirm: () => resolve(),
        })
    })
}

/**
 * @param {string} message
 * @param {{ title?: string, confirmText?: string, cancelText?: string, danger?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
function showConfirm(message, options = {}) {
    const {
        title = 'Confirmar',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        danger = false,
    } = options

    return new Promise((resolve) => {
        openModal({
            title,
            message,
            type: 'confirm',
            confirmText,
            cancelText,
            danger,
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false),
        })
    })
}

function openModal({ title, message, type, confirmText, cancelText, danger, onConfirm, onCancel }) {
    initUiPortal()

    const overlay = document.createElement('div')
    overlay.className = 'ui-modal-overlay'
    overlay.innerHTML = `
        <div class="ui-modal ui-modal--${type}" role="dialog" aria-modal="true" aria-labelledby="ui-modal-title">
            <div class="ui-modal__icon" aria-hidden="true">${UI_ICONS[type] || UI_ICONS.alert}</div>
            <h3 class="ui-modal__title" id="ui-modal-title">${escapeHtml(title)}</h3>
            <p class="ui-modal__message">${escapeHtml(message)}</p>
            <div class="ui-modal__actions">
                ${cancelText ? `<button type="button" class="ui-modal__btn ui-modal__btn--ghost" data-action="cancel">${escapeHtml(cancelText)}</button>` : ''}
                <button type="button" class="ui-modal__btn ${danger ? 'ui-modal__btn--danger' : 'ui-modal__btn--primary'}" data-action="confirm">${escapeHtml(confirmText)}</button>
            </div>
        </div>
    `

    const close = (confirmed) => {
        overlay.classList.remove('ui-modal-overlay--visible')
        setTimeout(() => {
            overlay.remove()
            if (confirmed) onConfirm?.()
            else onCancel?.()
        }, 300)
    }

    overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true))
    overlay.querySelector('[data-action="cancel"]')?.addEventListener('click', () => close(false))

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay && cancelText) close(false)
    })

    document.addEventListener('keydown', function onKey(event) {
        if (event.key === 'Escape' && cancelText) {
            document.removeEventListener('keydown', onKey)
            close(false)
        }
    })

    uiModalRoot.appendChild(overlay)
    requestAnimationFrame(() => overlay.classList.add('ui-modal-overlay--visible'))
}

/**
 * @param {Element|Element[]|NodeList} elements
 * @param {{ delay?: number, from?: 'bottom'|'left'|'scale' }} [options]
 */
function animarEntrada(elements, options = {}) {
    const { delay = 80, from = 'bottom' } = options
    const list = normalizeElements(elements)

    list.forEach((el, index) => {
        el.classList.add('ui-animate-item')
        if (from === 'left') el.classList.add('ui-animate-from-left')
        if (from === 'scale') el.classList.add('ui-animate-from-scale')
        el.style.setProperty('--ui-delay', `${index * delay}ms`)
    })

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            list.forEach((el) => el.classList.add('ui-animate-visible'))
        })
    })
}

/**
 * @param {Element|Element[]|NodeList} sections
 * @param {{ delay?: number }} [options]
 */
function animarSecoes(sections, options = {}) {
    animarEntrada(sections, { delay: options.delay ?? 120, from: 'bottom' })
}

function normalizeElements(elements) {
    if (!elements) return []
    if (elements instanceof Element) return [elements]
    if (elements instanceof NodeList || Array.isArray(elements)) return [...elements].filter(Boolean)
    return []
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

document.addEventListener('DOMContentLoaded', () => {
    initUiPortal()

    document.querySelectorAll('.card, .publicacao-app, .materia-conteudo').forEach((el) => {
        el.classList.add('ui-page-enter')
    })
})
