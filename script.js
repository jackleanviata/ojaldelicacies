/* =============================================
   OJAL GROCERIES – script.js
   All public site functionality
   ============================================= */

'use strict';

/* ── CONSTANTS ──────────────────────────────── */
const BUSINESS = {
  name:    'Ojal Groceries',
  phone:   '0769675130',
  wa:      '254769675130',
  till:    '8404706',
  location:'Embul Bul, Ngong, Kenya',
  slogan:  "Your neighbourhood's freshest delicacies — always nearby, always good.",
  hours:   'Mon–Sat: 6 AM – 9 PM | Sunday: 7 AM – 8 PM'
};

/* ── DEFAULT DATA ────────────────────────────── */
const DEFAULT_PRODUCTS = [
  { id:'p1', name:'Boiled Eggs',   category:'delicacy', price:10,  unit:'per piece', emoji:'🥚', desc:'Farm-fresh eggs, perfectly boiled. Great for a quick protein snack.',         available:true  },
  { id:'p2', name:'Smokies',       category:'delicacy', price:30,  unit:'per piece', emoji:'🌭', desc:'Juicy, smoky sausages – a Kenyan street-food classic.',                    available:true  },
  { id:'p3', name:'Sausages',      category:'delicacy', price:50,  unit:'per piece', emoji:'🍖', desc:'Savoury grilled sausages, cooked fresh on order.',                         available:true  },
  { id:'p4', name:'Omena',         category:'fish',     price:80,  unit:'per 100g',  emoji:'🐟', desc:'Dried silver cyprinid — a protein-rich Kenyan staple, sold fresh daily.', available:true  },
  { id:'p5', name:'Fresh Fish',    category:'fish',     price:200, unit:'per kg',    emoji:'🐠', desc:'Whole or filleted fresh fish, sourced from local suppliers.',              available:true  },
  { id:'p6', name:'Grocery Items', category:'grocery',  price:0,   unit:'varies',    emoji:'🛒', desc:'Essentials: flour, rice, oil, sugar, salt, and much more in stock.',       available:true  }
];

const DEFAULT_OFFERS = [
  { id:'o1', title:'Breakfast Bundle',  emoji:'🌅', desc:'2 boiled eggs + 1 smokie – the perfect morning combo.', origPrice:50,  offerPrice:40, badge:'Save 20%' },
  { id:'o2', title:'Protein Pack',      emoji:'💪', desc:'5 boiled eggs + 2 sausages + omena, packed with nutrition.', origPrice:180, offerPrice:150, badge:'Save KES 30' },
  { id:'o3', title:'Family Fish Deal',  emoji:'🐟', desc:'500g fresh fish + 200g omena – complete your family meal.', origPrice:280, offerPrice:240, badge:'Best Value' }
];

const DEFAULT_GALLERY = [
  { id:'g1', caption:'Morning smokies, hot off the grill',   emoji:'🌭', color:'#74C69D' },
  { id:'g2', caption:'Fresh boiled eggs every morning',       emoji:'🥚', color:'#95D5B2' },
  { id:'g3', caption:'Our daily grocery selection',           emoji:'🛒', color:'#40916C' },
  { id:'g4', caption:'Omena – a Kenyan classic',              emoji:'🐟', color:'#2D6A4F' },
  { id:'g5', caption:'Fresh fish – sourced locally',          emoji:'🐠', color:'#52B788' },
  { id:'g6', caption:'Friendly neighbourhood service',        emoji:'😊', color:'#1B4332' }
];

const DEFAULT_TESTIMONIALS = [
  { id:'t1', name:'Jane Wanjiku',    rating:5, text:'The smokies here are the best in Ngong! I stop by every morning on my way to work. Fresh, affordable, and always ready.', location:'Embul Bul resident' },
  { id:'t2', name:'Peter Kamau',     rating:5, text:'I buy all my weekly groceries here. The prices are fair and the owner is always friendly. Highly recommend Ojal Groceries!', location:'Ngong town' },
  { id:'t3', name:'Mercy Akinyi',    rating:5, text:'The fresh fish is always good quality. I love that I can M-Pesa easily. Shopping here is always a great experience.', location:'Embul Bul' },
  { id:'t4', name:'David Mutua',     rating:4, text:'Great neighbourhood shop. Convenient, affordable and the boiled eggs are always perfectly done. Will keep coming back!', location:'Ngong' }
];

/* ── LOCAL STORAGE HELPERS ───────────────────── */
const DB = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
};

/* Initialise data on first load */
function initData() {
  if (!DB.get('oj_products', null))     DB.set('oj_products',     DEFAULT_PRODUCTS);
  if (!DB.get('oj_offers', null))       DB.set('oj_offers',       DEFAULT_OFFERS);
  if (!DB.get('oj_gallery', null))      DB.set('oj_gallery',      DEFAULT_GALLERY);
  if (!DB.get('oj_testimonials', null)) DB.set('oj_testimonials', DEFAULT_TESTIMONIALS);
  if (!DB.get('oj_settings', null))     DB.set('oj_settings',     BUSINESS);
  if (!DB.get('oj_admin', null))        DB.set('oj_admin',        { username:'admin', password:'admin123' });
}

/* ── LOADER ─────────────────────────────────── */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 600);
  });
}

/* ── NAVBAR ─────────────────────────────────── */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const toggle    = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (!navbar) return;

  /* Scroll shadow */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* Mobile toggle */
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    navLinks?.classList.toggle('open');
  });

  /* Close on link click */
  navLinks?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle?.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  /* Active link on scroll */
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));
}

/* ── SCROLL REVEAL ───────────────────────────── */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

/* ── FOOTER YEAR ─────────────────────────────── */
function initFooter() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── TOAST ───────────────────────────────────── */
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── PRODUCTS ────────────────────────────────── */
function renderProducts() {
  const grid     = document.getElementById('productsGrid');
  const orderList= document.getElementById('orderProductList');
  if (!grid) return;

  const products = DB.get('oj_products', DEFAULT_PRODUCTS);
  grid.innerHTML = '';
  if (orderList) orderList.innerHTML = '';

  if (!products.length) {
    grid.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }

  products.forEach(p => {
    /* Product card */
    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.dataset.category = p.category;
    card.dataset.name      = p.name.toLowerCase();
    card.innerHTML = `
      <div class="product-img">${p.emoji || '🛍️'}</div>
      ${p.price > 0 ? `<div class="product-price-tag">KES ${p.price} <small style="opacity:.7;font-size:.7em">${p.unit || ''}</small></div>` : ''}
      <div class="product-body">
        <p class="product-cat">${categoryLabel(p.category)}</p>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.desc || ''}</p>
        <span class="product-status ${p.available ? '' : 'out'}">${p.available ? '✅ In Stock' : '❌ Out of Stock'}</span>
      </div>`;
    grid.appendChild(card);

    /* Order checkbox */
    if (orderList && p.available) {
      const item = document.createElement('label');
      item.className = 'product-checkbox-item';
      item.innerHTML = `
        <input type="checkbox" name="orderProduct" value="${p.id}" data-name="${p.name}" data-price="${p.price}" />
        <span>${p.emoji || ''} ${p.name}${p.price > 0 ? ` – KES ${p.price}` : ''}</span>
        <div class="qty-control" style="display:none">
          <button type="button" class="qty-btn" data-action="minus">−</button>
          <span class="qty-val">1</span>
          <button type="button" class="qty-btn" data-action="plus">+</button>
        </div>`;
      const cb = item.querySelector('input[type=checkbox]');
      const qty = item.querySelector('.qty-control');
      cb.addEventListener('change', () => {
        qty.style.display = cb.checked ? 'flex' : 'none';
        updateOrderSummary();
      });
      item.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const valEl = item.querySelector('.qty-val');
          let v = parseInt(valEl.textContent) || 1;
          v = btn.dataset.action === 'plus' ? v + 1 : Math.max(1, v - 1);
          valEl.textContent = v;
          updateOrderSummary();
        });
      });
      orderList.appendChild(item);
    }
  });

  /* Re-run reveal for dynamically added cards */
  initReveal();
}

function categoryLabel(cat) {
  return { delicacy:'Delicacy', grocery:'Grocery', fish:'Fish & Seafood' }[cat] || cat;
}

/* Product Search & Filter */
function initProductControls() {
  const search  = document.getElementById('productSearch');
  const tabs    = document.getElementById('filterTabs');
  let currentFilter = 'all';

  const applyFilter = () => {
    const q = (search?.value || '').trim().toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const matchCat  = currentFilter === 'all' || card.dataset.category === currentFilter;
      const matchName = !q || card.dataset.name?.includes(q);
      card.classList.toggle('hidden', !(matchCat && matchName));
    });
    const visible = document.querySelectorAll('.product-card:not(.hidden)');
    const grid = document.getElementById('productsGrid');
    const existing = grid?.querySelector('.no-results');
    if (!visible.length && grid) {
      if (!existing) {
        const msg = document.createElement('p');
        msg.className = 'no-results'; msg.textContent = '😕 No products match your search.';
        grid.appendChild(msg);
      }
    } else { existing?.remove(); }
  };

  search?.addEventListener('input', applyFilter);
  tabs?.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      applyFilter();
    });
  });
}

/* ── ORDER SUMMARY ───────────────────────────── */
function updateOrderSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  if (!summaryItems) return;

  const selected = document.querySelectorAll('input[name="orderProduct"]:checked');
  if (!selected.length) {
    summaryItems.innerHTML = '<p class="empty-summary">No items selected yet.</p>';
    if (summaryTotal) summaryTotal.innerHTML = '';
    return;
  }

  let html = ''; let total = 0;
  selected.forEach(cb => {
    const qty   = parseInt(cb.closest('label')?.querySelector('.qty-val')?.textContent || '1');
    const price = parseFloat(cb.dataset.price || '0');
    const sub   = price * qty;
    total += sub;
    html += `<div class="summary-item">
      <span class="summary-item-name">${cb.dataset.name} × ${qty}</span>
      <span class="summary-item-price">${price > 0 ? 'KES ' + sub : 'Ask for price'}</span>
    </div>`;
  });

  summaryItems.innerHTML = html;
  if (summaryTotal) {
    summaryTotal.innerHTML = `<span>Estimated Total</span><span>KES ${total}</span>`;
  }
}

/* ── ORDER FORM ──────────────────────────────── */
function initOrderForm() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateOrderForm()) return;

    const name    = document.getElementById('customerName')?.value.trim();
    const phone   = document.getElementById('customerPhone')?.value.trim();
    const notes   = document.getElementById('orderNotes')?.value.trim();
    const selected= document.querySelectorAll('input[name="orderProduct"]:checked');

    let orderLines = [];
    selected.forEach(cb => {
      const qty = parseInt(cb.closest('label')?.querySelector('.qty-val')?.textContent || '1');
      const price= parseFloat(cb.dataset.price || '0');
      orderLines.push(`• ${cb.dataset.name} × ${qty}${price > 0 ? ' (KES ' + (price*qty) + ')' : ''}`);
    });

    const settings = DB.get('oj_settings', BUSINESS);
    const msg = encodeURIComponent(
      `Hello ${settings.name}! 🛒\n\n` +
      `*New Order from ${name}*\n` +
      `Phone: ${phone}\n\n` +
      `*Items Ordered:*\n${orderLines.join('\n')}\n\n` +
      (notes ? `*Special Instructions:*\n${notes}\n\n` : '') +
      `📍 Please confirm availability and delivery/pickup details. Thank you!`
    );

    const waNum = settings.wa || BUSINESS.wa;
    window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank', 'noopener');
    showToast('✅ Opening WhatsApp to send your order!');
    form.reset();
    document.querySelectorAll('.qty-control').forEach(q => q.style.display = 'none');
    document.querySelectorAll('.qty-val').forEach(q => q.textContent = '1');
    updateOrderSummary();
  });
}

function validateOrderForm() {
  let valid = true;
  const name = document.getElementById('customerName');
  const phone= document.getElementById('customerPhone');
  const nameErr = document.getElementById('nameError');
  const phoneErr= document.getElementById('phoneError');
  const prodErr = document.getElementById('productError');

  if (nameErr) nameErr.textContent = '';
  if (phoneErr) phoneErr.textContent = '';
  if (prodErr) prodErr.textContent = '';

  if (!name?.value.trim()) {
    if (nameErr) nameErr.textContent = 'Please enter your name.';
    valid = false;
  }
  if (!phone?.value.trim() || !/^0[17]\d{8}$/.test(phone.value.trim())) {
    if (phoneErr) phoneErr.textContent = 'Please enter a valid Kenyan phone number.';
    valid = false;
  }
  const selected = document.querySelectorAll('input[name="orderProduct"]:checked');
  if (!selected.length) {
    if (prodErr) prodErr.textContent = 'Please select at least one product.';
    valid = false;
  }
  return valid;
}

/* ── PAYMENT FORM ────────────────────────────── */
function initPaymentForm() {
  const form = document.getElementById('paymentForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const payName   = document.getElementById('payName')?.value.trim();
    const payCode   = document.getElementById('payCode')?.value.trim();
    const payAmount = document.getElementById('payAmount')?.value.trim();
    const payPhone  = document.getElementById('payPhone')?.value.trim();

    if (!payName || !payCode || !payAmount || !payPhone) {
      showToast('⚠️ Please fill in all payment fields.'); return;
    }

    const settings = DB.get('oj_settings', BUSINESS);
    const msg = encodeURIComponent(
      `Hello ${settings.name}! 💳\n\n` +
      `*Payment Confirmation*\n` +
      `Name: ${payName}\n` +
      `Phone: ${payPhone}\n` +
      `M-Pesa Code: ${payCode}\n` +
      `Amount: KES ${payAmount}\n` +
      `Till: ${settings.till || BUSINESS.till}\n\n` +
      `Please confirm receipt. Thank you!`
    );

    const waNum = settings.wa || BUSINESS.wa;
    window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank', 'noopener');
    showToast('✅ Opening WhatsApp to confirm payment!');
    form.reset();
  });
}

/* ── OFFERS ─────────────────────────────────── */
function renderOffers() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;

  const offers = DB.get('oj_offers', DEFAULT_OFFERS);
  grid.innerHTML = '';

  if (!offers.length) {
    grid.innerHTML = '<p class="offer-empty">No special offers at the moment. Check back soon!</p>';
    return;
  }

  offers.forEach(o => {
    const card = document.createElement('div');
    card.className = 'offer-card reveal';
    card.innerHTML = `
      ${o.badge ? `<span class="offer-badge">${o.badge}</span>` : ''}
      <div class="offer-emoji">${o.emoji || '🏷️'}</div>
      <h3 class="offer-title">${o.title}</h3>
      <p class="offer-desc">${o.desc}</p>
      <div class="offer-pricing">
        ${o.origPrice ? `<span class="offer-orig">KES ${o.origPrice}</span>` : ''}
        <span class="offer-new">KES ${o.offerPrice}</span>
      </div>`;
    grid.appendChild(card);
  });

  initReveal();
}

/* ── GALLERY ─────────────────────────────────── */
let galleryItems = [];
let lightboxIndex = 0;

function renderGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  galleryItems = DB.get('oj_gallery', DEFAULT_GALLERY);
  grid.innerHTML = '';

  galleryItems.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-item reveal';
    el.innerHTML = `
      <div class="gallery-item-inner" style="background:${item.color || '#40916C'}">
        <span class="gallery-item-emoji">${item.emoji || '📷'}</span>
        <span class="gallery-item-caption">${item.caption || ''}</span>
      </div>
      <div class="gallery-item-overlay"><span>🔍</span></div>`;
    el.addEventListener('click', () => openLightbox(i));
    grid.appendChild(el);
  });

  initReveal();
}

function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  document.getElementById('lightbox')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const item = galleryItems[lightboxIndex];
  if (!item) return;
  const wrap    = document.getElementById('lightboxImgWrap');
  const caption = document.getElementById('lightboxCaption');
  if (wrap)    wrap.innerHTML    = `<div style="width:100%;height:100%;background:${item.color};display:flex;align-items:center;justify-content:center;font-size:8rem;border-radius:12px">${item.emoji || '📷'}</div>`;
  if (caption) caption.textContent = item.caption || '';
}

function initGallery() {
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightbox();
  });
  document.getElementById('lightboxNext')?.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % galleryItems.length;
    updateLightbox();
  });
  document.getElementById('lightbox')?.addEventListener('click', e => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  /* Keyboard navigation */
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % galleryItems.length; updateLightbox(); }
    if (e.key === 'ArrowLeft')  { lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length; updateLightbox(); }
    if (e.key === 'Escape')     closeLightbox();
  });
}

/* ── TESTIMONIALS SLIDER ──────────────────────── */
let slideIndex    = 0;
let slideInterval = null;

function renderTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dots  = document.getElementById('sliderDots');
  if (!track) return;

  const items = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS);
  track.innerHTML = '';
  if (dots) dots.innerHTML = '';

  items.forEach((t, i) => {
    const stars = '⭐'.repeat(parseInt(t.rating) || 5);
    const card  = document.createElement('div');
    card.className = 'testimonial-card';
    card.innerHTML = `
      <div class="testimonial-inner">
        <div class="review-stars">${stars}</div>
        <p class="review-text">"${t.text}"</p>
        <div class="review-author">
          <strong>${t.name}</strong>
          <span>${t.location || ''}</span>
        </div>
      </div>`;
    track.appendChild(card);

    if (dots) {
      const dot = document.createElement('div');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dots.appendChild(dot);
    }
  });

  goToSlide(0);
  startAutoSlide(items.length);
}

function goToSlide(i) {
  const track  = document.getElementById('testimonialsTrack');
  const dots   = document.querySelectorAll('.slider-dot');
  const items  = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS);
  if (!track || !items.length) return;
  slideIndex = ((i % items.length) + items.length) % items.length;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  dots.forEach((d, idx) => d.classList.toggle('active', idx === slideIndex));
}

function startAutoSlide(len) {
  clearInterval(slideInterval);
  if (len <= 1) return;
  slideInterval = setInterval(() => goToSlide(slideIndex + 1), 5000);
}

function initSlider() {
  document.getElementById('prevSlide')?.addEventListener('click', () => {
    const len = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS).length;
    goToSlide(slideIndex - 1);
    startAutoSlide(len);
  });
  document.getElementById('nextSlide')?.addEventListener('click', () => {
    const len = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS).length;
    goToSlide(slideIndex + 1);
    startAutoSlide(len);
  });
}

/* ── INIT ALL ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initData();
  initLoader();
  initNavbar();
  initReveal();
  initFooter();
  renderProducts();
  initProductControls();
  renderOffers();
  renderGallery();
  initGallery();
  renderTestimonials();
  initSlider();
  initOrderForm();
  initPaymentForm();
});