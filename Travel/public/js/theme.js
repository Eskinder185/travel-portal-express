(() => {
  // If there's no .container after the header, wrap the remaining body children.
  const hasContainer = document.querySelector('.container');
  if (!hasContainer) {
    const header = document.querySelector('.header'); // from nav
    const wrap = document.createElement('main');
    wrap.className = 'container';
    const body = document.body;

    // Move everything except the header & the scripts that injected it
    const nodes = Array.from(body.children).filter(n => n !== header && n.id !== 'navbar');
    if (header) header.insertAdjacentElement('afterend', wrap);
    else body.prepend(wrap);
    nodes.forEach(n => {
      if (n.tagName !== 'SCRIPT' || !/nav\.js|theme\.js/.test(n.src)) wrap.appendChild(n);
    });
  }
})();
