document.querySelectorAll('.ip-text').forEach(function (el) {
  el.addEventListener('click', function () {
    const teks = this.dataset.copy;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(teks).then(() => kasihFeedback(this));
    } else {
      // fallback untuk HTTP / browser lama
      const ta = document.createElement('textarea');
      ta.value = teks;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      kasihFeedback(this);
    }
  });
});

function kasihFeedback(el) {
  const asli = el.innerText;
  el.innerText = '✅ Tersalin!';
  setTimeout(() => {
    el.innerText = asli;
  }, 1500);
}