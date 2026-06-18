/* =============================================
   OJAL GROCERIES – admin.js
   Admin dashboard: auth, CRUD, session
   ============================================= */

'use strict';

/* ── AUTH ────────────────────────────────────── */
function checkSession() {
  return sessionStorage.getItem('oj_admin_session') === 'true';
}

function login(username, password) {
  const creds = DB.get('oj_admin', { username: 'admin', password: 'admin123' });
  if (username === creds.username && password === creds.password) {
    sessionStorage.setItem('oj_admin_session', 'true');
    return true;
  }
  return false;
}

function logout() {
  sessionStorage.removeItem('oj_admin_session');
  location.reload();
}

function initAuth() {
  const loginScreen = document.getElementById('loginScreen');
  const adminWrap   = document.getElementById('adminWrap');
  const loginForm   = document.getElementById('loginForm');
  const loginError  = document.getElementById('loginError');

  if (checkSession()) {
    loginScreen.style.display = 'none';
    adminWrap.style.display   = 'flex';
    initDashboard();
  } else {
    loginScreen.style.display = 'flex';
    adminWrap.style.display   = 'none';
  }

  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('loginUser')?.value.trim();
    const p = document.getElementById('loginPass')?.value;
    if (login(u, p)) {
      loginScreen.style.display = 'none';
      adminWrap.style.display   = 'flex';
      initDashboard();
    } else {
      if (loginError) loginError.textContent = '❌ Invalid username or password.';
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', logout);
}

/* ── DASHBOARD ───────────────────────────────── */
function initDashboard() {
  updateDashStats();
  initSidebar();
  initSidebarToggle();
  initProductsAdmin();
  initOffersAdmin();
  initGalleryAdmin();
  initTestimonialsAdmin();
  initSettingsAdmin();
}

function updateDashStats() {
  const p  = DB.get('oj_products',     DEFAULT_PRODUCTS);
  const o  = DB.get('oj_offers',       DEFAULT_OFFERS);
  const g  = DB.get('oj_gallery',      DEFAULT_GALLERY);
  const t  = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS);
  const el = id => document.getElementById(id);
  if (el('dashProducts')) el('dashProducts').textContent = p.length;
  if (el('dashOffers'))   el('dashOffers').textContent   = o.length;
  if (el('dashGallery'))  el('dashGallery').textContent  = g.length;
  if (el('dashReviews'))  el('dashReviews').textContent  = t.length;
}

/* ── SIDEBAR ─────────────────────────────────── */
function initSidebar() {
  const links     = document.querySelectorAll('.sidebar-link[data-panel]');
  const panels    = document.querySelectorAll('.admin-panel');
  const pageTitle = document.getElementById('adminPageTitle');

  function switchPanel(panelId) {
    panels.forEach(p => p.classList.remove('active'));
    links.forEach(l => l.classList.remove('active'));
    document.getElementById('panel-' + panelId)?.classList.add('active');
    document.querySelector(`.sidebar-link[data-panel="${panelId}"]`)?.classList.add('active');
    const titles = { dashboard:'Dashboard', products:'Manage Products', offers:'Manage Offers', gallery:'Manage Gallery', testimonials:'Manage Reviews', settings:'Settings' };
    if (pageTitle) pageTitle.textContent = titles[panelId] || panelId;
    updateDashStats();
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      switchPanel(link.dataset.panel);
      /* Close sidebar on mobile */
      document.getElementById('adminSidebar')?.classList.remove('open');
    });
  });

  /* Quick action buttons on dashboard */
  document.querySelectorAll('.qa-btn[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });
}

function initSidebarToggle() {
  const sidebar = document.getElementById('adminSidebar');
  document.getElementById('sidebarToggleBtn')?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
  });
}

/* ── TOAST (admin) ───────────────────────────── */
function adminToast(msg, duration = 2800) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── PRODUCTS ADMIN ──────────────────────────── */
function initProductsAdmin() {
  renderProductsTable();

  document.getElementById('addProductBtn')?.addEventListener('click', () => {
    resetProductForm();
    showProductForm(true);
  });
  document.getElementById('cancelProductForm')?.addEventListener('click', () => showProductForm(false));
  document.getElementById('productForm')?.addEventListener('submit', saveProduct);
}

function showProductForm(show) {
  const card = document.getElementById('productFormCard');
  if (card) card.style.display = show ? 'block' : 'none';
}

function resetProductForm(product = null) {
  const el = id => document.getElementById(id);
  el('productId').value     = product?.id        || '';
  el('pName').value         = product?.name      || '';
  el('pCategory').value     = product?.category  || 'delicacy';
  el('pPrice').value        = product?.price     || '';
  el('pUnit').value         = product?.unit      || '';
  el('pDesc').value         = product?.desc      || '';
  el('pEmoji').value        = product?.emoji     || '';
  el('pAvailable').checked  = product?.available !== false;
  el('productFormTitle').textContent = product ? 'Edit Product' : 'Add Product';
}

function saveProduct(e) {
  e.preventDefault();
  const el = id => document.getElementById(id)?.value.trim();
  const name = el('pName');
  if (!name) { adminToast('⚠️ Product name is required.'); return; }

  const products = DB.get('oj_products', DEFAULT_PRODUCTS);
  const id       = document.getElementById('productId')?.value || 'p' + Date.now();
  const isEdit   = products.findIndex(p => p.id === id) > -1;

  const product = {
    id,
    name,
    category:  el('pCategory') || 'delicacy',
    price:     parseFloat(el('pPrice')) || 0,
    unit:      el('pUnit') || '',
    desc:      el('pDesc') || '',
    emoji:     el('pEmoji') || '🛍️',
    available: document.getElementById('pAvailable')?.checked !== false
  };

  if (isEdit) {
    const idx = products.findIndex(p => p.id === id);
    products[idx] = product;
  } else {
    products.push(product);
  }

  DB.set('oj_products', products);
  renderProductsTable();
  showProductForm(false);
  adminToast(isEdit ? '✅ Product updated!' : '✅ Product added!');
  updateDashStats();
}

function editProduct(id) {
  const products = DB.get('oj_products', DEFAULT_PRODUCTS);
  const p = products.find(x => x.id === id);
  if (!p) return;
  resetProductForm(p);
  showProductForm(true);
  document.getElementById('productFormCard')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  let products = DB.get('oj_products', DEFAULT_PRODUCTS);
  products = products.filter(p => p.id !== id);
  DB.set('oj_products', products);
  renderProductsTable();
  adminToast('🗑️ Product deleted.');
  updateDashStats();
}

function renderProductsTable() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  const products = DB.get('oj_products', DEFAULT_PRODUCTS);

  if (!products.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-table">No products yet. Add your first product above.</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.emoji || '—'}</td>
      <td><strong>${p.name}</strong></td>
      <td>${categoryLabel(p.category)}</td>
      <td>${p.price > 0 ? 'KES ' + p.price + (p.unit ? ' / ' + p.unit : '') : '—'}</td>
      <td><span class="status-badge ${p.available ? 'status-yes' : 'status-no'}">${p.available ? 'In Stock' : 'Out of Stock'}</span></td>
      <td class="table-actions">
        <button class="tbl-btn tbl-btn-edit" onclick="editProduct('${p.id}')">Edit</button>
        <button class="tbl-btn tbl-btn-del"  onclick="deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

/* ── OFFERS ADMIN ────────────────────────────── */
function initOffersAdmin() {
  renderOffersTable();
  document.getElementById('addOfferBtn')?.addEventListener('click', () => { resetOfferForm(); showOfferForm(true); });
  document.getElementById('cancelOfferForm')?.addEventListener('click', () => showOfferForm(false));
  document.getElementById('offerForm')?.addEventListener('submit', saveOffer);
}

function showOfferForm(show) {
  const card = document.getElementById('offerFormCard');
  if (card) card.style.display = show ? 'block' : 'none';
}

function resetOfferForm(offer = null) {
  const el = id => document.getElementById(id);
  el('offerId').value      = offer?.id        || '';
  el('oTitle').value       = offer?.title     || '';
  el('oEmoji').value       = offer?.emoji     || '';
  el('oDesc').value        = offer?.desc      || '';
  el('oOrigPrice').value   = offer?.origPrice || '';
  el('oOfferPrice').value  = offer?.offerPrice|| '';
  el('oBadge').value       = offer?.badge     || '';
  el('offerFormTitle').textContent = offer ? 'Edit Offer' : 'Add Offer';
}

function saveOffer(e) {
  e.preventDefault();
  const el = id => document.getElementById(id)?.value.trim();
  if (!el('oTitle') || !el('oOfferPrice')) { adminToast('⚠️ Title and offer price are required.'); return; }

  const offers = DB.get('oj_offers', DEFAULT_OFFERS);
  const id     = document.getElementById('offerId')?.value || 'o' + Date.now();
  const isEdit = offers.findIndex(o => o.id === id) > -1;

  const offer = {
    id, title: el('oTitle'), emoji: el('oEmoji') || '🏷️',
    desc: el('oDesc') || '', origPrice: parseFloat(el('oOrigPrice')) || 0,
    offerPrice: parseFloat(el('oOfferPrice')) || 0, badge: el('oBadge') || ''
  };

  if (isEdit) { const idx = offers.findIndex(o => o.id === id); offers[idx] = offer; }
  else        { offers.push(offer); }

  DB.set('oj_offers', offers);
  renderOffersTable();
  showOfferForm(false);
  adminToast(isEdit ? '✅ Offer updated!' : '✅ Offer added!');
  updateDashStats();
}

function editOffer(id) {
  const o = DB.get('oj_offers', DEFAULT_OFFERS).find(x => x.id === id);
  if (!o) return;
  resetOfferForm(o);
  showOfferForm(true);
  document.getElementById('offerFormCard')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  DB.set('oj_offers', DB.get('oj_offers', DEFAULT_OFFERS).filter(o => o.id !== id));
  renderOffersTable();
  adminToast('🗑️ Offer deleted.');
  updateDashStats();
}

function renderOffersTable() {
  const tbody = document.getElementById('offersTableBody');
  if (!tbody) return;
  const offers = DB.get('oj_offers', DEFAULT_OFFERS);

  if (!offers.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table">No offers yet.</td></tr>';
    return;
  }

  tbody.innerHTML = offers.map(o => `
    <tr>
      <td><strong>${o.emoji || ''} ${o.title}</strong></td>
      <td>KES ${o.offerPrice}</td>
      <td>${o.badge || '—'}</td>
      <td class="table-actions">
        <button class="tbl-btn tbl-btn-edit" onclick="editOffer('${o.id}')">Edit</button>
        <button class="tbl-btn tbl-btn-del"  onclick="deleteOffer('${o.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

/* ── GALLERY ADMIN ───────────────────────────── */
function initGalleryAdmin() {
  renderGalleryTable();
  document.getElementById('addGalleryBtn')?.addEventListener('click', () => { resetGalleryForm(); showGalleryForm(true); });
  document.getElementById('cancelGalleryForm')?.addEventListener('click', () => showGalleryForm(false));
  document.getElementById('galleryForm')?.addEventListener('submit', saveGalleryItem);
}

function showGalleryForm(show) {
  const card = document.getElementById('galleryFormCard');
  if (card) card.style.display = show ? 'block' : 'none';
}

function resetGalleryForm(item = null) {
  const el = id => document.getElementById(id);
  el('galleryId').value    = item?.id      || '';
  el('gCaption').value     = item?.caption || '';
  el('gEmoji').value       = item?.emoji   || '';
  el('gColor').value       = item?.color   || '#95D5B2';
  el('galleryFormTitle').textContent = item ? 'Edit Gallery Item' : 'Add Gallery Item';
}

function saveGalleryItem(e) {
  e.preventDefault();
  const el = id => document.getElementById(id)?.value.trim();
  if (!el('gCaption')) { adminToast('⚠️ Caption is required.'); return; }

  const gallery = DB.get('oj_gallery', DEFAULT_GALLERY);
  const id      = document.getElementById('galleryId')?.value || 'g' + Date.now();
  const isEdit  = gallery.findIndex(g => g.id === id) > -1;

  const item = {
    id, caption: el('gCaption'),
    emoji: el('gEmoji') || '📷',
    color: document.getElementById('gColor')?.value || '#95D5B2'
  };

  if (isEdit) { const idx = gallery.findIndex(g => g.id === id); gallery[idx] = item; }
  else        { gallery.push(item); }

  DB.set('oj_gallery', gallery);
  renderGalleryTable();
  showGalleryForm(false);
  adminToast(isEdit ? '✅ Gallery item updated!' : '✅ Gallery item added!');
  updateDashStats();
}

function editGalleryItem(id) {
  const item = DB.get('oj_gallery', DEFAULT_GALLERY).find(x => x.id === id);
  if (!item) return;
  resetGalleryForm(item);
  showGalleryForm(true);
  document.getElementById('galleryFormCard')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteGalleryItem(id) {
  if (!confirm('Delete this gallery item?')) return;
  DB.set('oj_gallery', DB.get('oj_gallery', DEFAULT_GALLERY).filter(g => g.id !== id));
  renderGalleryTable();
  adminToast('🗑️ Gallery item deleted.');
  updateDashStats();
}

function renderGalleryTable() {
  const tbody = document.getElementById('galleryTableBody');
  if (!tbody) return;
  const gallery = DB.get('oj_gallery', DEFAULT_GALLERY);

  if (!gallery.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table">No gallery items yet.</td></tr>';
    return;
  }

  tbody.innerHTML = gallery.map(g => `
    <tr>
      <td>${g.emoji || '—'}</td>
      <td>${g.caption}</td>
      <td><span class="color-swatch" style="background:${g.color}"></span> ${g.color}</td>
      <td class="table-actions">
        <button class="tbl-btn tbl-btn-edit" onclick="editGalleryItem('${g.id}')">Edit</button>
        <button class="tbl-btn tbl-btn-del"  onclick="deleteGalleryItem('${g.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

/* ── TESTIMONIALS ADMIN ──────────────────────── */
function initTestimonialsAdmin() {
  renderTestimonialsTable();
  document.getElementById('addTestimonialBtn')?.addEventListener('click', () => { resetTestimonialForm(); showTestimonialForm(true); });
  document.getElementById('cancelTestimonialForm')?.addEventListener('click', () => showTestimonialForm(false));
  document.getElementById('testimonialForm')?.addEventListener('submit', saveTestimonial);
}

function showTestimonialForm(show) {
  const card = document.getElementById('testimonialFormCard');
  if (card) card.style.display = show ? 'block' : 'none';
}

function resetTestimonialForm(t = null) {
  const el = id => document.getElementById(id);
  el('testimonialId').value = t?.id       || '';
  el('tName').value         = t?.name     || '';
  el('tRating').value       = t?.rating   || '5';
  el('tText').value         = t?.text     || '';
  el('tLocation').value     = t?.location || '';
  el('testimonialFormTitle').textContent = t ? 'Edit Review' : 'Add Review';
}

function saveTestimonial(e) {
  e.preventDefault();
  const el = id => document.getElementById(id)?.value.trim();
  if (!el('tName') || !el('tText')) { adminToast('⚠️ Name and review text are required.'); return; }

  const testimonials = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS);
  const id           = document.getElementById('testimonialId')?.value || 't' + Date.now();
  const isEdit       = testimonials.findIndex(t => t.id === id) > -1;

  const item = {
    id, name: el('tName'),
    rating: parseInt(el('tRating')) || 5,
    text: el('tText'), location: el('tLocation') || ''
  };

  if (isEdit) { const idx = testimonials.findIndex(t => t.id === id); testimonials[idx] = item; }
  else        { testimonials.push(item); }

  DB.set('oj_testimonials', testimonials);
  renderTestimonialsTable();
  showTestimonialForm(false);
  adminToast(isEdit ? '✅ Review updated!' : '✅ Review added!');
  updateDashStats();
}

function editTestimonial(id) {
  const t = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS).find(x => x.id === id);
  if (!t) return;
  resetTestimonialForm(t);
  showTestimonialForm(true);
  document.getElementById('testimonialFormCard')?.scrollIntoView({ behavior: 'smooth' });
}

function deleteTestimonial(id) {
  if (!confirm('Delete this review?')) return;
  DB.set('oj_testimonials', DB.get('oj_testimonials', DEFAULT_TESTIMONIALS).filter(t => t.id !== id));
  renderTestimonialsTable();
  adminToast('🗑️ Review deleted.');
  updateDashStats();
}

function renderTestimonialsTable() {
  const tbody = document.getElementById('testimonialsTableBody');
  if (!tbody) return;
  const testimonials = DB.get('oj_testimonials', DEFAULT_TESTIMONIALS);

  if (!testimonials.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table">No reviews yet.</td></tr>';
    return;
  }

  tbody.innerHTML = testimonials.map(t => `
    <tr>
      <td><strong>${t.name}</strong><br><small style="color:var(--text-light)">${t.location || ''}</small></td>
      <td>${'⭐'.repeat(parseInt(t.rating) || 5)}</td>
      <td style="max-width:260px;font-size:.83rem;color:var(--text-mid)">${t.text.substring(0, 80)}${t.text.length > 80 ? '…' : ''}</td>
      <td class="table-actions">
        <button class="tbl-btn tbl-btn-edit" onclick="editTestimonial('${t.id}')">Edit</button>
        <button class="tbl-btn tbl-btn-del"  onclick="deleteTestimonial('${t.id}')">Delete</button>
      </td>
    </tr>`).join('');
}

/* ── SETTINGS ADMIN ──────────────────────────── */
function initSettingsAdmin() {
  const settings = DB.get('oj_settings', BUSINESS);
  const el = id => document.getElementById(id);

  /* Pre-fill settings form */
  if (el('setBizName'))     el('setBizName').value     = settings.name     || '';
  if (el('setBizPhone'))    el('setBizPhone').value    = settings.phone    || '';
  if (el('setBizWA'))       el('setBizWA').value       = settings.wa       || '';
  if (el('setBizTill'))     el('setBizTill').value     = settings.till     || '';
  if (el('setBizLocation')) el('setBizLocation').value = settings.location || '';
  if (el('setBizSlogan'))   el('setBizSlogan').value   = settings.slogan   || '';
  if (el('setBizHours'))    el('setBizHours').value    = settings.hours    || '';

  /* Save settings */
  document.getElementById('settingsForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const s = {
      name:     el('setBizName')?.value.trim()     || settings.name,
      phone:    el('setBizPhone')?.value.trim()    || settings.phone,
      wa:       el('setBizWA')?.value.trim()       || settings.wa,
      till:     el('setBizTill')?.value.trim()     || settings.till,
      location: el('setBizLocation')?.value.trim() || settings.location,
      slogan:   el('setBizSlogan')?.value.trim()   || settings.slogan,
      hours:    el('setBizHours')?.value.trim()    || settings.hours
    };
    DB.set('oj_settings', s);
    adminToast('✅ Settings saved!');
  });

  /* Change credentials */
  document.getElementById('passwordForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const newUser = el('newUsername')?.value.trim();
    const newPass = el('newPassword')?.value;
    const msg     = document.getElementById('settingsMsg');
    if (!newUser || !newPass) { if (msg) msg.textContent = '⚠️ Both fields are required.'; return; }
    if (newPass.length < 6)   { if (msg) msg.textContent = '⚠️ Password must be at least 6 characters.'; return; }
    DB.set('oj_admin', { username: newUser, password: newPass });
    if (msg) msg.textContent = '✅ Credentials updated. You will be logged out.';
    setTimeout(logout, 2000);
  });
}

/* ── BOOTSTRAP ───────────────────────────────── */
document.addEventListener('DOMContentLoaded', initAuth);