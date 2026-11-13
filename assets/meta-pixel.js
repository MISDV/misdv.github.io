/* Meta Pixel: no remote request until an explicit marketing choice. */
(() => {
  if (window.GiuggioloniMetaPixel) return;
  const id = '1820829302492303';
  let allowed = false, loading = false, ready = false, initialized = false, pageViewSent = false;
  if (!window.fbq) {
    const queue = function () { queue.callMethod ? queue.callMethod.apply(queue, arguments) : queue.queue.push(arguments); };
    window.fbq = queue;
    if (!window._fbq) window._fbq = queue;
    queue.push = queue;
    queue.loaded = true;
    queue.version = '2.0';
    queue.queue = [];
  }
  // A local Lume history change must not send another page view.
  window.fbq.disablePushState = true;
  window.fbq('consent', 'revoke');
  function activate() {
    if (!allowed || !ready) return;
    if (!initialized) {
      window.fbq('set', 'autoConfig', false, id);
      window.fbq('init', id);
      initialized = true;
    }
    window.fbq('consent', 'grant');
    if (!pageViewSent) { window.fbq('track', 'PageView'); pageViewSent = true; }
  }
  function setConsent(value) {
    allowed = value === true;
    if (!allowed) { window.fbq('consent', 'revoke'); return; }
    if (ready) { activate(); return; }
    if (loading) return;
    loading = true;
    const script = document.createElement('script');
    script.id = 'meta-pixel-library';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.addEventListener('load', () => { loading = false; ready = true; activate(); }, { once: true });
    script.addEventListener('error', () => { loading = false; script.remove(); }, { once: true });
    document.head.append(script);
  }
  window.GiuggioloniMetaPixel = Object.freeze({ id, setConsent });
})();
