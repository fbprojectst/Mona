// ============================================
// دوال مشتركة بين جميع صفحات الموقع العام
// ============================================

let storeSettingsCache = null;

// تفعيل زر القائمة على الموبايل
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// تحميل إعدادات المتجر (الاسم، اللوقو، الألوان، التواصل) وتطبيقها على الصفحة
async function loadStoreSettings() {
  const { data, error } = await supabaseClient
    .from('store_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return null;

  storeSettingsCache = data;

  // تطبيق الألوان كمتغيرات CSS
  if (data.primary_color) {
    document.documentElement.style.setProperty('--burgundy', data.primary_color);
    document.documentElement.style.setProperty('--burgundy-deep', shadeColor(data.primary_color, -30));
  }
  if (data.secondary_color) {
    document.documentElement.style.setProperty('--gold', data.secondary_color);
  }

  // تطبيق اسم المتجر
  const storeName = data.store_name || 'Mona';
  document.querySelectorAll('.logo span').forEach(el => el.textContent = storeName);
  document.querySelectorAll('.footer-brand h3').forEach(el => el.textContent = storeName);
  document.title = document.title.replace(/^Mona/, storeName);

  // تطبيق اللوقو
  if (data.logo_url) {
    document.querySelectorAll('.logo-img').forEach(el => el.src = data.logo_url);
  }

  // تحديث روابط واتساب/انستقرام/فيسبوك بالفوتر
  updateSocialLinks(data);

  return data;
}

// تفتيح/تغميق لون هيكس بنسبة معينة (لإنشاء تدرج غامق تلقائيًا من اللون الأساسي)
function shadeColor(hex, percent) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, Math.round(r + (r * percent / 100))));
  g = Math.max(0, Math.min(255, Math.round(g + (g * percent / 100))));
  b = Math.max(0, Math.min(255, Math.round(b + (b * percent / 100))));

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function updateSocialLinks(settings) {
  const phone = settings.whatsapp_number || '212600655645';
  const waMessage = encodeURIComponent(`مرحباً ${settings.store_name || 'Mona'}، أعجبتني منتجاتكم وأود معرفة التفاصيل والأسعار 🌸`);

  document.querySelectorAll('.social-icon[aria-label="WhatsApp"]').forEach(el => {
    el.href = `https://api.whatsapp.com/send?phone=${phone}&text=${waMessage}`;
  });

  const instagramLinks = document.querySelectorAll('.social-icon[aria-label="Instagram"]');
  if (settings.instagram_url) {
    instagramLinks.forEach(el => {
      el.href = settings.instagram_url;
      el.style.display = '';
    });
  } else {
    instagramLinks.forEach(el => el.style.display = 'none');
  }

  const facebookLinks = document.querySelectorAll('.social-icon[aria-label="Facebook"]');
  if (settings.facebook_url) {
    facebookLinks.forEach(el => {
      el.href = settings.facebook_url;
      el.style.display = '';
    });
  } else {
    facebookLinks.forEach(el => el.style.display = 'none');
  }
}

// تحميل الفئات النشطة في الـ nav والفوتر
async function loadCategoriesIntoNav() {
  const { data: categories, error } = await supabaseClient
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !categories) return;

  const nav = document.getElementById('mainNav');
  if (nav) {
    const homeLink = nav.querySelector('a[href="index.html"]');
    categories.forEach(cat => {
      const a = document.createElement('a');
      a.href = `category.html?id=${cat.id}`;
      a.textContent = cat.name;
      nav.insertBefore(a, homeLink.nextSibling);
    });
  }

  const footerCategories = document.getElementById('footerCategories');
  if (footerCategories) {
    categories.forEach(cat => {
      const a = document.createElement('a');
      a.href = `category.html?id=${cat.id}`;
      a.textContent = cat.name;
      footerCategories.appendChild(a);
    });
  }
}

// تنسيق عرض السعر (مع دعم الخصم و"حسب الطلب")
function formatPriceHTML(product) {
  if (product.price_on_request) {
    return `<span class="price">حسب الطلب</span>`;
  }
  if (product.sale_price && product.sale_price < product.price) {
    return `
      <span class="price-old">${product.price} درهم</span>
      <span class="price price-sale">${product.sale_price} درهم</span>
    `;
  }
  return `<span class="price">${product.price} درهم</span>`;
}

// بناء بطاقة منتج (تستخدم بالرئيسية وصفحة الفئة)
function buildProductCard(product) {
  const img = (product.images && product.images.length > 0) ? product.images[0] : '';
  return `
    <a href="product.html?id=${product.id}" class="product-card">
      <div class="product-img" style="background-image:url('${img}')"></div>
      <div class="product-info">
        <h3>${product.name}</h3>
        ${formatPriceHTML(product)}
      </div>
    </a>
  `;
}

// نص واتساب لطلب منتج معين
function buildWhatsAppOrderLink(product) {
  const phone = (storeSettingsCache && storeSettingsCache.whatsapp_number) || '212600655645';
  const pageUrl = window.location.href;
  const text = encodeURIComponent(`مرحباً، أود طلب: ${product.name}\nرابط المنتج: ${pageUrl}`);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  initNavToggle();
  await loadStoreSettings();
  loadCategoriesIntoNav();
});
