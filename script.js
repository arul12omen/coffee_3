/* =========================================================
   PENGATURAN  (ubah bagian ini saja untuk data kedai)
   ========================================================= */
var WA = '62XXXXXXXXXX';   // nomor WhatsApp tanpa + dan tanpa 0 di depan
var NAME = 'Nama Kedai';

var MENU = {
  kopi: [
    { n: 'Espresso', d: 'Shot pekat dengan crema tebal.', p: 'Rp 20.000' },
    { n: 'Americano', d: 'Espresso dan air panas, bersih dan ringan.', p: 'Rp 25.000' },
    { n: 'Flat White', d: 'Espresso dengan susu velvety.', p: 'Rp 30.000' },
    { n: 'Kopi Susu Gula Aren', d: 'Manis legit, favorit semua orang.', p: 'Rp 25.000' },
    { n: 'V60 Manual Brew', d: 'Seduh tangan, pilih biji sesuai selera.', p: 'Rp 35.000' },
    { n: 'Cold Brew', d: 'Diseduh dingin berjam-jam, halus dan segar.', p: 'Rp 30.000' }
  ],
  nonkopi: [
    { n: 'Matcha Latte', d: 'Matcha creamy dengan susu pilihan.', p: 'Rp 35.000' },
    { n: 'Cokelat Panas', d: 'Cokelat pekat yang menghangatkan.', p: 'Rp 25.000' },
    { n: 'Lemon Tea', d: 'Teh segar dengan perasan lemon.', p: 'Rp 20.000' },
    { n: 'Fresh Juice', d: 'Buah segar tanpa pemanis tambahan.', p: 'Rp 25.000' }
  ],
  makanan: [
    { n: 'Croissant', d: 'Renyah di luar, lembut di dalam.', p: 'Rp 15.000' },
    { n: 'Roti Bakar', d: 'Pilihan topping manis atau gurih.', p: 'Rp 20.000' },
    { n: 'Kentang Goreng', d: 'Teman ngobrol yang sempurna.', p: 'Rp 25.000' },
    { n: 'Cookies', d: 'Dipanggang setiap hari.', p: 'Rp 15.000' }
  ]
};

/* =========================================================
   MENU + PESANAN
   ========================================================= */
var cat = 'kopi';
var cart = {};
var rows = document.getElementById('rows');
var tabs = document.querySelectorAll('.tab');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMenu() {
  rows.innerHTML = MENU[cat].map(function (i) {
    var q = cart[i.n] || 0;
    var n = esc(i.n);
    return '<div class="row">' +
      '<div class="mi"><div class="nm">' + n + '</div><div class="ds">' + esc(i.d) + '</div></div>' +
      '<div class="rc"><div class="pr">' + esc(i.p) + '</div><div class="ctl">' +
      (q ? '<button class="cb" data-act="sub" data-n="' + n + '" aria-label="Kurangi ' + n + '">−</button><span class="qty">' + q + '</span>' : '') +
      '<button class="cb add" data-act="add" data-n="' + n + '" aria-label="Tambah ' + n + '">+</button>' +
      '</div></div></div>';
  }).join('');

  tabs.forEach(function (t) {
    var on = t.dataset.cat === cat;
    t.classList.toggle('on', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

function updateOrder() {
  var names = Object.keys(cart).filter(function (k) { return cart[k] > 0; });
  var total = names.reduce(function (s, k) { return s + cart[k]; }, 0);
  var msg, text, cta;

  if (total) {
    msg = 'Halo ' + NAME + ', saya mau pesan:\n' +
      names.map(function (k) { return '- ' + cart[k] + 'x ' + k; }).join('\n') +
      '\n\nTerima kasih!';
    text = total + ' item dipilih';
    cta = 'Kirim pesanan';
  } else {
    msg = 'Halo ' + NAME + ', saya mau tanya.';
    text = 'Ada pertanyaan?';
    cta = 'Chat WhatsApp';
  }
  var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);

  // bar (layar kecil)
  document.getElementById('bar-text').textContent = text;
  document.getElementById('bar-cta').textContent = cta;
  document.getElementById('bar-link').href = url;

  // struk (panel kiri)
  document.getElementById('tk-count').textContent = total + ' item';
  document.getElementById('tk-cta').textContent = cta;
  document.getElementById('tk-link').href = url;
  document.getElementById('tk-empty').hidden = total > 0;
  document.getElementById('tk-list').innerHTML = names.map(function (k) {
    return '<li><b>' + cart[k] + '×</b><span>' + esc(k) + '</span></li>';
  }).join('');
}

rows.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-act]');
  if (!b) return;
  var n = b.dataset.n;
  // data-n sudah di-escape saat dirender; ambil nama asli dari MENU agar cocok
  var item = null;
  Object.keys(MENU).forEach(function (c) {
    MENU[c].forEach(function (i) { if (esc(i.n) === n) item = i; });
  });
  if (!item) return;
  cart[item.n] = Math.max(0, (cart[item.n] || 0) + (b.dataset.act === 'add' ? 1 : -1));
  renderMenu();
  updateOrder();
});

tabs.forEach(function (t) {
  t.addEventListener('click', function () {
    cat = t.dataset.cat;
    renderMenu();
  });
});

/* =========================================================
   PANEL KIRI BERGANTI SESUAI BAGIAN YANG SEDANG DILIHAT
   ========================================================= */
var scenes = document.querySelectorAll('.scene');
var indexLinks = document.querySelectorAll('.index a');
var sections = document.querySelectorAll('[data-scene]');

function setScene(id) {
  scenes.forEach(function (s) { s.classList.toggle('on', s.dataset.for === id); });
  indexLinks.forEach(function (a) { a.classList.toggle('on', a.dataset.for === id); });
}

if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) setScene(e.target.dataset.scene);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { io.observe(s); });
}

/* =========================================================
   GALERI: KLIK FOTO -> TAMPIL BESAR DI PANEL KIRI
   ========================================================= */
var tiles = document.querySelectorAll('.tile');
var preview = document.getElementById('preview');
var previewImg = document.getElementById('preview-img');
var previewCap = document.getElementById('preview-cap');

tiles.forEach(function (t) {
  t.addEventListener('click', function () {
    tiles.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
    preview.className = 'preview ' + t.dataset.cls;
    previewCap.textContent = t.dataset.title;
    var img = t.querySelector('img');
    if (img) {
      previewImg.src = img.src;
      previewImg.alt = img.alt;
      previewImg.hidden = false;
    } else {
      previewImg.hidden = true;
      previewImg.removeAttribute('src');
    }
  });
});

/* =========================================================
   MULAI
   ========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();
renderMenu();
updateOrder();