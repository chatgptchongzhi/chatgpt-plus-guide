(() => {
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[data-telegram-service]');
    if (!link || new URL(link.href).hostname !== 'wokee888.shop') return;
    if (typeof window.gtag === 'function') window.gtag('event', 'telegram_service_click', {
      article_slug: link.dataset.articleSlug, banner_id: link.dataset.bannerId,
      page_path: window.location.pathname, destination_host: 'wokee888.shop', transport_type: 'beacon'
    });
  });
})();
