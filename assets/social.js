(() => {
  const dialog = document.getElementById('instagram-preview');
  if (typeof dialog?.showModal !== 'function') return;

  const heading = document.getElementById('instagram-preview-title');
  const content = document.getElementById('instagram-preview-content');
  const fallback = document.getElementById('instagram-preview-link');
  const notice = document.getElementById('instagram-notice');

  dialog.addEventListener('close', () => {
    if (!dialog.open) content.replaceChildren();
  });
  for (const button of document.querySelectorAll('[data-instagram-post]')) {
    const code = button.dataset.instagramPost;
    if (!/^[A-Za-z0-9_-]+$/.test(code)) continue;
    const card = button.closest('.social-post');
    const permalink = card.querySelector('[data-post-permalink]');
    const title = card.querySelector('h3').textContent;
    button.addEventListener('click', () => {
      heading.textContent = title;
      fallback.href = permalink.href;

      const frame = document.createElement('iframe');
      frame.title = `Instagram · ${title}`;
      frame.referrerPolicy = 'no-referrer';
      frame.src = `https://www.instagram.com/p/${code}/embed/captioned/`;
      dialog.showModal();
      content.replaceChildren(frame);
    });
    button.hidden = false;
    notice.hidden = false;
  }
})();
