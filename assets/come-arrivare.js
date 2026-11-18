(() => {
  const page = document.querySelector('.arrival-page');
  if (!page) return;

  page.addEventListener('click', async event => {
    const control = event.target.closest('[data-arrival-event], [data-share-route]');
    if (!control) return;

    if (control.hasAttribute('data-arrival-event')) {
      window.GiuggioloniConsent?.trackArrival(control.dataset.arrivalEvent, control.dataset.route);
      return;
    }

    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const section = control.closest('.arrival-route');
    const fallback = section.querySelector('.arrival-share-copy');
    const field = fallback.querySelector('input');
    const status = section.querySelector('[role="status"]');
    const url = field.value;
    status.textContent = '';
    fallback.hidden = true;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: `Agriturismo Giuggioloni · ${section.querySelector('h3').textContent}`, url });
        window.GiuggioloniConsent?.trackArrival('directions_share', section.id);
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      status.textContent = 'Link copiato.';
      window.GiuggioloniConsent?.trackArrival('directions_share', section.id);
    } catch {
      fallback.hidden = false;
      field.focus();
      field.select();
    }
  });
})();
