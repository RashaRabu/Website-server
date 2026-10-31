// Tap the IP pill to copy the server address
document.addEventListener('DOMContentLoaded', () => {
  const box = document.querySelector('.ip-box');
  if (!box) return;

  const label = box.querySelector('span');
  const original = label.textContent;
  const ip = (box.dataset.ip || original).trim();
  let timer;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ip);
    } catch {
      const t = document.createElement('textarea');
      t.value = ip;
      t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    label.textContent = 'Copied!';
    box.classList.add('copied');
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = original;
      box.classList.remove('copied');
    }, 1500);
  };

  box.setAttribute('role', 'button');
  box.tabIndex = 0;
  box.addEventListener('click', copy);
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); }
  });
});
