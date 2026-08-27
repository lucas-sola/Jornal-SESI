/* Camada visual compartilhada: sem dependências e sem alterar o conteúdo. */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealSelector = [
    '.categoria-hero', '.hero-section', '.noticia-principal', '.noticia-sidebar',
    '.post-card', '.main-card', '.mini-card', '.materia-container',
    '.materia-conteudo', '.publicar-container', '.acesso-negado-card', '.card'
  ].join(', ');
  const imageWrapperSelector = [
    '.post-card-img-wrap', '.imagem-wrap', '.sidebar-imagem-wrap',
    '.materia-imagem', '.imagem-destaque-preview'
  ].join(', ');
  let observer;

  function loadStyles() {
    if (document.getElementById('journal-animations-css')) return;
    const stylesheet = document.createElement('link');
    stylesheet.id = 'journal-animations-css';
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'src/styles/animations.css';
    document.head.appendChild(stylesheet);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `journal-toast journal-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  function showConfirm({ titulo = 'Confirmar ação', mensagem = 'Deseja continuar?' } = {}) {
    return Promise.resolve(window.confirm(`${titulo}\n\n${mensagem}`));
  }

  function revealElement(element) {
    element.classList.add('is-revealed');
    observer?.unobserve(element);
  }

  function prepareReveal(element, index) {
    if (element.dataset.revealReady) return;
    element.dataset.revealReady = 'true';

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealElement(element);
      return;
    }

    element.dataset.reveal = '';
    element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 80}ms`);
    observer.observe(element);
  }

  function prepareImage(wrapper) {
    if (wrapper.dataset.imageLoadingReady) return;
    const image = wrapper.querySelector('img');
    if (!image) return;

    wrapper.dataset.imageLoadingReady = 'true';
    wrapper.classList.add('image-loading');
    const finishLoading = () => wrapper.classList.remove('image-loading');

    if (image.complete) finishLoading();
    else {
      image.addEventListener('load', finishLoading, { once: true });
      image.addEventListener('error', finishLoading, { once: true });
    }
  }

  function prepareElements(root = document) {
    root.querySelectorAll?.(revealSelector).forEach(prepareReveal);
    root.querySelectorAll?.(imageWrapperSelector).forEach(prepareImage);
  }

  function setupObserver() {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) revealElement(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px' });
  }

  function setupPageTransitions() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || reduceMotion.matches || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
          link.target || link.hasAttribute('download')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname ||
          !url.pathname.endsWith('.html')) return;

      event.preventDefault();
      document.body.classList.add('motion-page--leaving');
      window.setTimeout(() => { window.location.href = url.href; }, 220);
    });

    window.addEventListener('pageshow', () => document.body.classList.remove('motion-page--leaving'));
  }

  function init() {
    loadStyles();
    document.body.classList.add('motion-page');
    setupObserver();
    prepareElements();
    setupPageTransitions();

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches?.(revealSelector)) prepareReveal(node, 0);
        if (node.matches?.(imageWrapperSelector)) prepareImage(node);
        prepareElements(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });

    window.refreshJournalAnimations = prepareElements;
    window.showToast = showToast;
    window.showConfirm = showConfirm;
    window.showAlert = ({ titulo = 'Aviso', mensagem = '' } = {}) => showToast(`${titulo}: ${mensagem}`, 'info');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
