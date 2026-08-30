// ============================================
// دوال مشتركة بين جميع صفحات الموقع العام
// ============================================

// تفعيل زر القائمة على الموبايل
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

// تحميل الفئات النشطة في الـ nav والفوتر
async function loadCategoriesIntoNav() {
  const { data: categories, error } = await supabaseClient
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !categories) return;

  // إضافة روابط الفئات في القائمة العلوية (بعد "الرئيسية")
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

  // إضافة روابط الفئات في الفوتر
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
  const phone = '212600655645';
  const pageUrl = window.location.href;
  const text = encodeURIComponent(`مرحباً، أود طلب: ${product.name}\nرابط المنتج: ${pageUrl}`);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  loadCategoriesIntoNav();
});
