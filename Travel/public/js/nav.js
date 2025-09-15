(function () {
  const mount = document.getElementById('navbar');
  if (!mount) {
    console.error('Navbar mount point not found');
    return;
  }

  console.log('Loading navbar...');

  // Load the shared nav HTML synchronously
  fetch('/partials/nav.html')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return res.text();
    })
    .then(html => {
      console.log('Navbar HTML loaded, injecting...');
      mount.innerHTML = html;
      
      // Ensure navbar is positioned at the top
      const header = mount.querySelector('.header');
      if (header) {
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '1000';
        header.style.backgroundColor = '#ffffff';
        header.style.borderBottom = '1px solid #e5e7eb';
        console.log('Navbar positioned at top');
      }
      
      // Mobile toggle
      const btn = mount.querySelector('.menu-toggle');
      const nav = mount.querySelector('#site-nav');
      if (btn && nav) {
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!open));
          nav.classList.toggle('open');
        });
      }

      // Highlight active link (works for / and /index.html)
      const path = location.pathname.replace(/\/$/, '/index.html');
      mount.querySelectorAll('.nav-link').forEach(a => {
        const href = a.getAttribute('href');
        if (href === path || (a.dataset.match === '/' && path.endsWith('/index.html'))) {
          a.classList.add('active');
        }
      });
      
      console.log('Navbar setup complete');
    })
    .catch(err => {
      console.error('Failed to load navbar:', err);
      // Fallback: show a simple navbar
      mount.innerHTML = '<header class="header" style="position:sticky;top:0;z-index:1000;background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 16px;"><a href="/index.html" class="brand">Travlr Getaways</a></header>';
    });
})();
