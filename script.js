/* ─── CURSOR ────────────────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.1;
  followerY += (mouseY - followerY) * 0.1;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

/* ─── NAV SCROLL ────────────────────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

/* ─── MOBILE MENU ───────────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

/* ─── SCROLL REVEAL ─────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ─── HERO TITLE STAGGER ────────────────────────────────────── */
document.querySelectorAll('.hero-title .line').forEach((line, i) => {
  line.style.opacity = '0';
  line.style.transform = 'translateY(40px)';
  line.style.transition = `opacity 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s, transform 0.8s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`;
});

window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero-title .line').forEach(line => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    });
  }, 100);
});

/* ─── CONTACT FORM ──────────────────────────────────────────── */
const form = document.getElementById('contact-form');
const successMsg = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();

  const btn = form.querySelector('.submit-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnArrow = btn.querySelector('.btn-arrow');
  // Loading state
  btnText.textContent = 'Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  const data = {
    name: form.name.value,
    company: form.company.value,
    phone: form.phone.value,
    'product-type': form['product-type'].value,
    quantity: form.quantity.value,
    size: form.size.value,
    message: form.message.value,
  };

  const meta = document.querySelector('meta[name="api-base"]');
  const base = (meta && meta.content) ? meta.content.replace(/\/$/, '') : '';
  const endpoint = base ? base + '/api/contact' : '/api/contact';

  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(r => r.json())
    .then(res => {
      if (res && res.ok) {
        btnText.textContent = 'Sent!';
        btnArrow.textContent = '✓';
        btn.style.background = '#4ade80';
        successMsg.style.display = 'block';
        form.reset();
        setTimeout(() => {
          btnText.textContent = 'Send Inquiry';
          btnArrow.textContent = '→';
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.style.background = '';
          successMsg.style.display = 'none';
        }, 4000);
      } else {
        // Try to show server error message
        const errMsg = (res && res.error) ? res.error : 'send_failed';
        throw new Error(errMsg);
      }
    })
    .catch(err => {
      console.error('Send error', err);
      btnText.textContent = 'Try again';
      btn.disabled = false;
      btn.style.opacity = '1';
    });
});

/* ─── SMOOTH ACTIVE NAV LINK ────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.style.color = 'var(--text)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ─── PARALLAX HERO GRID ────────────────────────────────────── */
const heroGrid = document.querySelector('.hero-bg-grid');
window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight) {
    heroGrid.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }
});

/* ─── PRODUCT CARD TILT ─────────────────────────────────────── */
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ─── NUMBER COUNTER ANIMATION ──────────────────────────────── */
function animateCount(el, end, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const isPercent = el.textContent.includes('%');
  const prefix = el.textContent.match(/^[₨]/) ? '₨' : '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (end - start) * eased);
    el.textContent = prefix + value + (isPercent ? '%' : '');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(num => {
        const text = num.textContent;
        const numericMatch = text.match(/[\d.]+/);
        if (numericMatch && !text.includes('h') && !text.includes('MOQ')) {
          animateCount(num, parseFloat(numericMatch[0]));
        }
      });
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);
